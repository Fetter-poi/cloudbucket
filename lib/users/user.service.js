'use strict';

var UserModel = require('./user.model');

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
