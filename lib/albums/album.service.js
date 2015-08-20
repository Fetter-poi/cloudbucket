'use strict';

var AlbumModel = require('./album.model');

function parseCriteria(options) {
  var criteria = {};
  if (options.q) {
    criteria.title = {
      $regex: options.q,
      $options: 'i'
    };
  }
  return criteria;
}

exports.findAlbums = function (pageRequest, options) {
  var query = AlbumModel.find(parseCriteria(options));
  return query.skip(pageRequest.skip())
    .limit(pageRequest.limit())
    .exec();
};

exports.countAlbums = function (options) {
  return AlbumModel.count(parseCriteria(options)).exec();
};
