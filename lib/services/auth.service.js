'use strict';

var UserModel = require('../models/user.model');

exports.validateUser = function (user) {
  return UserModel.findOne({username: user.name}).lean().exec();
};
