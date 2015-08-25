'use strict';

var mongoose = require('mongoose');

var BaseSchema = require('../commons/base-schema');

var fileSchema = new BaseSchema({
  dateTimeOriginal: Date,
  contentType: String,
  filename: String,
  checksum: {type: String, index: true},
  size: Number,
  metadata: {},
  albums: [String]
});

var FileModel = mongoose.model('File', fileSchema);

module.exports = FileModel;
