'use strict';

var mongoose = require('mongoose');

var BaseSchema = require('../commons/base-schema');

var fileSchema = new BaseSchema({
  dateTimeOriginal: Date,
  thumbnail: String,
  contentType: String,
  filename: String,
  originalFilename: String,
  checksum: {type: String, index: true},
  size: Number,
  height: Number,
  width: Number,
  metadata: {},
  albums: [String],
  tags: [String]
});

var FileModel = mongoose.model('File', fileSchema);

module.exports = FileModel;
