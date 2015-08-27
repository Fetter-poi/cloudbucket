'use strict';

var Q = require('q');
var express = require('express');

var router = express.Router();

var paging = require('../commons/paging');
var albumService = require('./album.service');
var AlbumResource = require('./album.resource');
var objectid = require('../middlewares/objectid');

router.route('/')
  .get(paging.parseRequest, function (req, res, next) {
    Q.all([
      albumService.findAlbums(req.pageRequest, req.query),
      albumService.countAlbums(req.query)
    ]).then(function (results) {
      var items = results[0];
      var count = results[1];
      var pagedResources = AlbumResource.pagedResources(items, count, req.pageRequest, req.originalUrl);
      res.hal(pagedResources);
    }, next);
  })
  .post(function (req, res, next) {
    var album = req.body;
    album.createdBy = req.session.user.username;
    albumService.createAlbum(album).then(function (doc) {
      res.status(201);
      res.setHeader('Location', '/v1/albums/' + doc._id);
      res.end();

    }, next);
  });


router.route('/slim')
  .get(function (req, res, next) {
    albumService.findAlbums().then(function (items) {
      res.send(items.map(function (item) {
        return {
          _id: item.id,
          title: item.title
        };
      }));
    }, next);
  });

router.route('/:id')
  .get(objectid('id'), function (req, res, next) {
    albumService.findAlbumById(req.params.id).then(function (doc) {
      var resource = new AlbumResource(doc);
      res.send(resource);
    }, next);
  })
  .delete(objectid('id'), function (req, res, next) {
    albumService.deleteAlbum(req.params.id).then(function () {
      res.status(204).end();
    }, next);
  })
  .patch(objectid('id'), function (req, res, next) {
    var update = req.body;
    update.lastModifiedBy = req.session.user.username;
    albumService.updateAlbum(req.params.id, update).then(function (doc) {
      var resource = new AlbumResource(doc);
      res.send(resource);
    }, next);
  });

router.route('/0/count')
  .get(function (req, res, next) {
    albumService.countFilesByAlbumId().then(function (count) {
      res.send({
        count: count
      });
    }, next);
  });

router.route('/:id/count')
  .get(objectid('id'), function (req, res, next) {
    albumService.countFilesByAlbumId(req.params.id).then(function (count) {
      res.send({
        count: count
      });
    }, next);
  });


module.exports = router;
