'use strict';

var Q = require('q');
var express = require('express');
var multiparty = require('multiparty');
var fs = require('fs');

var router = express.Router();

var paging = require('../commons/paging');
var fileService = require('./file.service');
var FileResource = require('./file.resource');

router.route('/')
  .get(paging.parseRequest, function (req, res, next) {
    Q.all([
      fileService.findFiles(req.pageRequest, req.query),
      fileService.countFiles(req.query)
    ]).then(function (results) {
      var items = results[0];
      var count = results[1];
      var pagedResources = FileResource.pagedResources(items, count, req.pageRequest, req.originalUrl);
      res.hal(pagedResources);
    }, next);
  });

router.route('/upload')
  .post(function (req, res, next) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, data) {
      if (err) {
        return next(err);
      }
      Q.all(data.file.map(function (file) {
        return fileService.upload(fs.createReadStream(file.path), file.originalFilename, file.headers['content-type'])
      })).then(function () {
        res.send({});
      }, next);
    });
  });

module.exports = router;
