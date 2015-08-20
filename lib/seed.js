'use strict';
var s3Service = require('./commons/s3-service');
var userSeed = require('./users/user.seed');

exports.init = function () {
  userSeed.seed();

  s3Service.seed();

};
