'use strict';

var _ = require('lodash');
var Q = require('q');
var express = require('express');
var multiparty = require('multiparty');
var router = express.Router();

var paging = require('../commons/paging');
var fileService = require('./file.service');
var FileResource = require('./file.resource');
var objectid = require('../middlewares/objectid');
var ErrorMessage = require('../commons/error-message');

var lwip = require('lwip');

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

function findFileById(req, res, next) {
  fileService.findFileById(req.params.id).then(function (doc) {
    if (doc) {
      req.entity = doc;
      next();
    } else {
      next(new ErrorMessage('File Not Found', 404));
    }
  }, next);
}


router.route('/:id')
  .get(objectid('id'), findFileById, function (req, res) {
    var resource = new FileResource(req.entity);
    res.send(resource);
  })
  .delete(objectid('id'), findFileById, function (req, res, next) {
    fileService.deleteFile(req.params.id).then(function () {
      res.status(204).end();
    }, next);
  });

router.route('/:id/download')
  .get(objectid('id'), findFileById, function (req, res, next) {
    fileService.fetchFile(req.params.id.toString()).then(function (data) {
      res.set('Content-Type', data.ContentType);
      if (req.query.thumbnail) {
        var imageType = _.last(data.ContentType.split(/\//));
        return Q.nfcall(lwip.open, data.Body, imageType)
          .then(function (image) {
            var width = image.width()
            var height = image.height()
            var min = width < height ? width : height;
            return Q.ninvoke(image, 'crop', min, min);
          })
          .then(function (image) {
            return Q.ninvoke(image, 'resize', 96);
          })
          .then(function (image) {
            return Q.ninvoke(image, 'toBuffer', imageType);
          })
          .then(function (image) {
            res.send(image);
          });
      } else {
        res.send(data.Body);
      }
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
        return fileService.upload(file);
      })).then(function (results) {
        if (results.length) {
          var doc = results[0];
          res.status(201);
          res.setHeader('Location', '/v1/files/' + doc._id);
          res.end();
        } else {
          next(400);
        }
      }, next);
    });
  });

module.exports = router;
