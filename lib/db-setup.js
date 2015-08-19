'use strict';

var mongoose = require('mongoose');

exports.init = function () {
  var mongodbUrl = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/cloudbucket'
  mongoose.connect(mongodbUrl);
};
