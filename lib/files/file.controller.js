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

router.route('/tags')
  .get(function (req, res, next) {
    fileService.findTags(req.query.q).then(function (tags) {
      res.send(tags);
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
  .patch(objectid('id'), function (req, res, next) {
    var update = req.body;
    update.lastModifiedBy = req.session.user.username;
    fileService.updateFile(req.params.id, update).then(function (doc) {
      var resource = new FileResource(doc);
      res.send(resource);
    }, next);
  })
  .delete(objectid('id'), findFileById, function (req, res, next) {
    fileService.deleteFile(req.entity).then(function () {
      res.status(204).end();
    }, next);
  });

router.route('/:id/download')
  .get(function (req, res, next) {
    fileService.fetchFile(req.params.id.toString()).then(function (data) {
      res.set('Content-Type', data.ContentType);
      if (req.query['content-disposition']) {
        res.set('Content-Disposition', req.query['content-disposition'] + '; filename=' + data.Metadata.filename);
      }
      res.send(data.Body);
    }, next);
  });

router.route('/upload')
  .post(function (req, res, next) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, data) {
      if (err) {
        return next(err);
      }
      if (!data.file) {
        return next(400);
      }
      Q.all(data.file.map(function (file) {
        return fileService.upload(file);
      })).then(function (results) {
        if (results.length) {
          var doc = results[0];
          if (doc) {
            res.status(201);
            res.setHeader('Location', '/v1/files/' + doc._id);
            res.end();
          } else {
            next(409);
          }
        } else {
          next(400);
        }
      }, next);
    });
  });

module.exports = router;
