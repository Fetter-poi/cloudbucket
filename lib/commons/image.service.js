'use strict';

var Q = require('q');
var _ = require('lodash');
var lwip = require('lwip');
var ExifImage = require('exif').ExifImage;

exports.isImage = function (contentType) {
  if (/^image/.test(contentType)) {
    var imageType = _.last(contentType.split(/\//));
    if (imageType === 'jpeg') {
      imageType = 'jpg';
    }
    return imageType;
  } else {
    return false;
  }
};

exports.exif = function (imagePath) {
  var deferred = Q.defer();
  new ExifImage({image: imagePath}, function (error, exifData) {
    if (error) {
      console.error(error);
      deferred.resolve(null);
    } else {
      deferred.resolve(exifData);
    }
  });
  return deferred.promise;
};

exports.cropAndResize = function (source, imageType) {
  var result = {};
  return Q.nfcall(lwip.open, source, imageType)
    .then(function (image) {
      var width = image.width();
      var height = image.height();
      result.width = width;
      result.height = height;
      var min = width < height ? width : height;
      return Q.ninvoke(image, 'crop', min, min);
    })
    .then(function (image) {
      return Q.ninvoke(image, 'resize', 96);
    })
    .then(function (image) {
      return Q.ninvoke(image, 'toBuffer', imageType);
    })
    .then(function (buffer) {
      result.buffer = buffer
      return result;
    });
};
