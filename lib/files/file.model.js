'use strict';

var mongoose = require('mongoose');

var BaseSchema = require('../commons/base-schema');

var fileSchema = new BaseSchema({
  contentType: String,
  filename: String,
  albums: [String]
});

var FileModel = mongoose.model('File', fileSchema);

module.exports = FileModel;
