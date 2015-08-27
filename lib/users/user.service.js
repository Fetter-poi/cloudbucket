'use strict';

var Q = require('q');
var UserModel = require('./user.model');
var cryptoService = require('../commons/crypto-service');

function parseCriteria(options) {
  var criteria = {};
  if (options.q) {
    criteria.displayName = {
      $regex: options.q,
      $options: 'i'
    };
  }
  return criteria;
}

exports.findUsers = function (pageRequest, options) {
  var query = UserModel.find(parseCriteria(options));
  return query.skip(pageRequest.skip())
    .limit(pageRequest.limit())
    .exec();
};

exports.countUsers = function (options) {
  return UserModel.count(parseCriteria(options)).exec();
};

exports.findByUsername = function (username) {
  return UserModel.findOne({username: username}).lean().exec();
};

exports.updateUser = function (id, data) {
  data.lastModifiedAt = Date.now();
  var passwordPromise = Q(null);
  if (data.password) {
    passwordPromise = Q.nfcall(cryptoService.hashText, data.password)
      .then(function (hashedPassword) {
        data.hashedPassword = hashedPassword;
        delete data.password;
      });
  }
  return passwordPromise.then(function () {
    return UserModel.findByIdAndUpdate(id, data, {new: true}).exec();
  });
};
