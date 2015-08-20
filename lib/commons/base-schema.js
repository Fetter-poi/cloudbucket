'use strict';

var util = require('util');

/** @require mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var baseSchema = {
  lastModifiedBy: String,
  createdBy: String,
  createdAt: {
    type: Date,
    'default': Date.now
  },
  lastModifiedAt: {
    type: Date,
    'default': Date.now
  },
  lastRemoteIp: String
};


/**
 *
 * @class
 */
var BaseSchema = function () {
  Schema.apply(this, arguments);
  this.add(baseSchema);
};

util.inherits(BaseSchema, Schema);

module.exports = BaseSchema;

