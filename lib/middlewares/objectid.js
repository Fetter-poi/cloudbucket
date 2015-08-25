'use strict';

var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (parameter) {
  return function (req, res, next) {
    if (req.params[parameter]) {
      if (ObjectId.isValid(req.params[parameter])) {
        req.params[parameter] = ObjectId(req.params[parameter]);
        return next();
      }
    }
    next(400);
  };
};
