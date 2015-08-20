'use strict';

var mongoose = require('mongoose');

var BaseSchema = require('../commons/base-schema');

var userSchema = new BaseSchema({
  username: {type: String, index: true, unique: true},
  displayName: String,
  hashedPassword: String
});

var UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
