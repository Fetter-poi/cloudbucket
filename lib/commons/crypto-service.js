'use strict';

var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

exports.hashText = function (text, callback) {
  Bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) {
      callback(err);
    }

    Bcrypt.hash(text, salt, function (err, hash) {
      if (err) {
        return callback(err);
      }
      callback(null, hash);
    });
  });
};

exports.compare = function (clear, hash, callback) {
  Bcrypt.compare(clear, hash, callback);
};

