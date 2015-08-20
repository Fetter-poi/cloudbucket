'use strict';

var ErrorMessage = require('./error-message');

/*jshint unused:false*/
module.exports = function (err, req, res, next) {
  var error = err instanceof ErrorMessage ? err : new ErrorMessage(err);
  error.path = req.originalUrl;
  res.status(error.code);
  if (/xml/.test(req.headers['accept']) && res.xml) {
    res.xml(error, 'error');
  } else {
    res.json(error);
  }
};

