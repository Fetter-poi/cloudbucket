'use strict';

var basicAuth = require('basic-auth');
var authService = require('../commons/auth.service');
var cryptoService = require('../commons/crypto-service');

module.exports = function (req, res, next) {
  function unauthorized() {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.status(401).end();
  }

  if (req.session && req.session.user) {
    return next();
  }

  var user = basicAuth(req);


  if (!user || !user.name || !user.pass) {
    return unauthorized();
  }

  authService.validateUser(user).then(function (doc) {
    if (doc) {
      cryptoService.compare(user.pass, doc.hashedPassword, function (err, isMatch) {
        if (err || !isMatch) {
          return unauthorized();
        }
        req.session.user = doc;
        next();
      });
    } else {
      unauthorized();
    }
  }, unauthorized);

};
