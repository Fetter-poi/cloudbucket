'use strict';

var ffmpeg = require('fluent-ffmpeg');

exports.isVideo = function (contentType) {
  return /^video/.test(contentType);
};

exports.thumbnail = function (input, folder) {

  ffmpeg(input).screenshots({
    timemarks: [1],
    folder: folder
  });

};



