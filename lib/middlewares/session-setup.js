'use strict';

var session = require('express-session');

module.exports = session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
});
