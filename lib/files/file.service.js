'use strict';

var Q = require('q');
var FileModel = require('./file.model');
var s3Service = require('../commons/s3-service');

function parseCriteria(options) {
  var criteria = {};
  return criteria;
}

exports.findFiles = function (pageRequest, options) {
  var query = FileModel.find(parseCriteria(options));
  return query.skip(pageRequest.skip())
    .limit(pageRequest.limit())
    .exec();
};

exports.countFiles = function (options) {
  return FileModel.count(parseCriteria(options)).exec();
};

exports.upload = function (input, filename, contentType) {
  return FileModel.create({
    filename: filename,
    contentType: contentType,
  }).then(function (doc) {
    return Q.nfcall(s3Service.upload, input, doc.id, filename, contentType);
  });
};
