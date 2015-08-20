'use strict';

var userService = require('../users/user.service');

exports.validateUser = function (user) {
  return userService.findByUsername(user.name);
};
