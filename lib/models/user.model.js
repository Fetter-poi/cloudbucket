'use strict';

var mongoose = require('mongoose');
var cryptoService = require('../services/crypto-service');

var UserModel = mongoose.model('User', {
  username: {type: String, index: true, unique: true},
  displayName: String,
  hashedPassword: String
});

UserModel.count().exec().then(function (count) {
  if (!count) {
    cryptoService.hashText(process.env['TEMP_PASSWORD'], function (err, hashedPassword) {
      if (err) {
        return;
      }
      var tempUser = {
        username: 'admin',
        displayName: 'Admin',
        hashedPassword: hashedPassword
      };
      UserModel.create(tempUser);
    });
  }
});

module.exports = UserModel;
