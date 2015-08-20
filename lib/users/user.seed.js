'use strict';

var cryptoService = require('../commons/crypto-service');
var UserModel = require('./user.model');


exports.seed = function () {

  return UserModel.count().exec().then(function (count) {
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
        return UserModel.create(tempUser);
      });
    }
  });
};
