'use strict';

var Q = require('q');
var moment = require('moment');
var fs = require('fs');
var crypto = require('crypto');
var FileModel = require('./file.model');
var s3Service = require('../commons/s3-service');
var ExifImage = require('exif').ExifImage;

function parseCriteria(options) {
  var criteria = {};
  if (options.album) {
    criteria.albums = options.album;
  } else {
    criteria.albums = {$size: 0};
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

exports.upload = function (file) {
  var contentType = file.headers['content-type'];
  var filename = file.originalFilename;
  var input = fs.createReadStream(file.path);
  var checksumStream = fs.createReadStream(file.path);
  var hash = crypto.createHash('sha1');
  var checksum = '';
  checksumStream.on('data', function (data) {
    hash.update(data, 'utf8');
  });
  checksumStream.on('end', function () {
    checksum = hash.digest('hex');
  });

  return FileModel.create({
    size: file.size,
    filename: filename,
    contentType: contentType

  }).then(function (doc) {
    return Q.nfcall(s3Service.upload, input, doc.id, filename, contentType).then(function () {
      doc.checksum = checksum;
      if (/^image/.test(contentType)) {
        var deferred = Q.defer();
        new ExifImage({image: file.path}, function (error, exifData) {
          if (error) {
            console.log(error);
          } else {
            doc.metadata = exifData;
            if (exifData.exif && exifData.exif.DateTimeOriginal) {
              var dateTimeOriginal = moment(exifData.exif.DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss');
              if (dateTimeOriginal.isValid()) {
                doc.dateTimeOriginal = dateTimeOriginal.toDate();
              }
            }
          }
          deferred.resolve(exifData);
        });
        return deferred.promise;
      }
    }).then(function () {
      return doc.save();
    });
  });
};


exports.findFileById = function (id) {
  return FileModel.findOne(id)
    .exec();
};


exports.deleteFile = function (id) {
  return FileModel.remove({_id: id})
    .exec();
};

exports.fetchFile = function (id) {
  return Q.nfcall(s3Service.getObject, id);
};
