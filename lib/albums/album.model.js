'use strict';

var mongoose = require('mongoose');

var BaseSchema = require('../commons/base-schema');

var albumSchema = new BaseSchema({
  title: String,
  permissions: [
    {
      user: String,
      grant: String
    }
  ]
});

var AlbumModel = mongoose.model('Album', albumSchema);

module.exports = AlbumModel;
