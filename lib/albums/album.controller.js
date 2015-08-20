'use strict';

var Q = require('q');
var express = require('express');

var router = express.Router();

var paging = require('../commons/paging');
var albumService = require('./album.service');
var AlbumResource = require('./album.resource');

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
  });

module.exports = router;
