'use strict';

var path = require('path');
var Q = require('q');
var moment = require('moment');
var fs = require('fs');
var crypto = require('crypto');
var FileModel = require('./file.model');
var s3Service = require('../commons/s3-service');
var imageService = require('../commons/image.service');
var videoService = require('../commons/video.service');
var tmp = require('tmp');

function parseCriteria(options) {
  var criteria = {};
  if (options) {

    if (options.album) {
      criteria.albums = options.album;
    } else {
      criteria.albums = {$size: 0};
    }
    if (options.type) {
      var regex = '^' + options.type;
      if (options.type === 'documents') {
        regex = 'application/(vnd.ms-|vnd.sun|pdf|msword|x-mswrite)';
      }
      criteria.contentType = new RegExp(regex);

    }
  }
  return criteria;
}

exports.findFiles = function (pageRequest, options) {
  var query = FileModel.find(parseCriteria(options));
  return query.skip(pageRequest.skip())
    .limit(pageRequest.limit())
    .sort({_id: -1})
    .exec();
};

exports.countFiles = function (options) {
  return FileModel.count(parseCriteria(options)).exec();
};

function computeChecksum(input) {
  var hash = crypto.createHash('sha1');
  var deferred = Q.defer();
  input.on('data', function (data) {
    hash.update(data, 'utf8');
  });
  input.on('end', function () {
    deferred.resolve(hash.digest('hex'));
  });
  input.on('error', function (err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

exports.upload = function (file, createdAt) {
  var contentType = file.headers['content-type'];
  var originalFilename = file.originalFilename.toLowerCase();
  var extension = path.extname(originalFilename).toLowerCase();
  var input = fs.createReadStream(file.path);
  return computeChecksum(fs.createReadStream(file.path))
    .then(function (checksum) {
      return FileModel.findOne({checksum: checksum}).exec()
        .then(function (doc) {
          if (doc) {
            return false;
          }
          return FileModel.create({
            size: file.size,
            checksum: checksum,
            createdAt: createdAt || Date.now(),
            originalFilename: originalFilename,
            contentType: contentType
          }).then(function (doc) {
            doc.filename = doc.id + extension;
            return s3Service.upload(input, doc.filename, originalFilename, contentType)
              .then(function () {
                // test if it's an image
                var imageType = imageService.isImage(contentType);
                if (imageType) {
                  doc.thumbnail = doc.id + '_thumb' + extension;
                  return Q.all([
                    imageService.exif(file.path).then(function (exifData) {
                      if (exifData) {
                        doc.metadata = exifData;
                        if (exifData.exif && exifData.exif.DateTimeOriginal) {
                          var dateTimeOriginal = moment(exifData.exif.DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss');
                          if (dateTimeOriginal.isValid()) {
                            doc.dateTimeOriginal = dateTimeOriginal.toDate();
                          }
                        }
                      }
                    }),
                    imageService.cropAndResize(file.path, imageType).then(function (result) {
                      doc.width = result.width;
                      doc.height = result.height;
                      return s3Service.upload(result.buffer, doc.thumbnail, doc.thumbnail, contentType);
                    })
                  ]);
                }
                // test if it's a video
                if (videoService.isVideo(contentType)) {
                  doc.thumbnail = doc.id + '_screenshot.png';
                  tmp.dir({unsafeCleanup: true}, function (err, folder, cleanupCallback) {
                    if (err) {
                      throw err;
                    }
                    var thumbPath = path.join(folder, 'tn.png');
                    videoService.thumbnail(file.path, folder);
                    setTimeout(function () {
                      imageService.cropAndResize(thumbPath, 'png').then(function (result) {
                        s3Service.upload(result.buffer, doc.thumbnail, doc.thumbnail, 'image/png').then(function () {
                          cleanupCallback();
                        });
                      });
                    }, 1000);
                  });
                }
              }).then(function () {
                return doc.save();
              });
          });
        });
    });
};


exports.findFileById = function (id) {
  return FileModel.findOne(id)
    .exec();
};

exports.deleteFile = function (file) {
  var promises = [s3Service.deleteObject(file.filename)];
  if (file.thumbnail) {
    promises.push(s3Service.deleteObject(file.thumbnail));
  }
  Q.all(promises).fail(function (err) {
    console.error(err);
  });
  return FileModel.remove({_id: file._id})
    .exec();
};

exports.fetchFile = function (id) {
  return s3Service.getObject(id);
};

exports.findTags = function (q) {
  var conditions = {};
  if (q) {
    conditions.tags = new RegExp('^' + q, 'i');
  }
  return FileModel.distinct('tags', conditions).exec();
};


exports.updateFile = function (id, data) {
  data.lastModifiedAt = Date.new;
  return FileModel.findByIdAndUpdate(id, data, {new: true}).exec();
};

exports.totalSize = function () {
  return FileModel.aggregate(
    {
      $group: {
        _id: null,
        totalSize: {$sum: '$size'}
      }
    }).exec()
    .then(function (res) {
      if (res.length) {
        return res[0].totalSize || 0;
      }
      return 0;
    });
};


