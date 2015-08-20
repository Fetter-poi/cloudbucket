'use strict';

var Q = require('q');
var express = require('express');

var router = express.Router();

var paging = require('../commons/paging');
var userService = require('./user.service');
var UserResource = require('./user.resource');

router.route('/')
  .get(paging.parseRequest, function (req, res, next) {
    Q.all([
      userService.findUsers(req.pageRequest, req.query),
      userService.countUsers(req.query)
    ]).then(function (results) {
      var items = results[0];
      var count = results[1];
      var pagedResources = UserResource.pagedResources(items, count, req.pageRequest, req.originalUrl);
      res.hal(pagedResources);
    }, next);
  });

module.exports = router;
