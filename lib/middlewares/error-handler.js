'use strict';

var ErrorMessage = require('../commons/error-message');

/*jshint unused:false*/
module.exports = function (err, req, res, next) {
  var error = err instanceof ErrorMessage ? err : new ErrorMessage(err);
  error.path = req.originalUrl;
  res.status(error.status);
  if (/xml/.test(req.headers['accept']) && res.xml) {
    res.xml(error, 'error');
  } else {
    console.error(error);
    res.json(error);
  }
};

