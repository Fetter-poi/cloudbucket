'use strict';

var AlbumModel = require('./album.model');
var FileModel = require('../files/file.model');


function parseCriteria(options) {
  var criteria = {};
  if (options) {
    if (options.q) {
      criteria.title = {
        $regex: options.q,
        $options: 'i'
      };
    }
  }
  return criteria;
}

exports.findAlbums = function (pageRequest, options) {
  var query = AlbumModel.find(parseCriteria(options));
  if (pageRequest) {
    return query.skip(pageRequest.skip())
      .limit(pageRequest.limit())
      .exec();
  } else {
    return query.sort({title: 1}).exec();
  }
};

exports.findAlbumById = function (id) {
  return AlbumModel.findOne(id)
    .exec();
};

exports.deleteAlbum = function (id) {
  return AlbumModel.remove({_id: id})
    .exec();
};

exports.countAlbums = function (options) {
  return AlbumModel.count(parseCriteria(options)).exec();
};


exports.countFilesByAlbumId = function (id) {
  if (id) {
    return FileModel.count({albums: id}).exec();
  }
  else {
    return FileModel.count({albums: {$size: 0}});
  }
};

exports.createAlbum = function (data) {
  return AlbumModel.create(data);
};


exports.updateAlbum = function (id, data) {
  data.lastModifiedAt = Date.new;
  return AlbumModel.findByIdAndUpdate(id, data, {new: true}).exec();
};
