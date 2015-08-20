'use strict';

/**
 * @require express
 */
var express = require('express');
var bodyParser = require('body-parser');

var hateoas = require('./commons/hateoas');

var router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

router.use(require('./middlewares/hal'));


var routes = [
  ['album', 'albums'],
  ['file', 'files'],
  ['user', 'users']
];

routes.forEach(function (route) {
  router.use('/' + route[1], require('./' + route[1] + '/' + route[0] + '.controller'));
});

var endpoint = new hateoas.Resource(null, routes.map(function (route) {
    return new hateoas.Link('/v1/' + route[1], route[0]);
  })
);

router.get('/', function (req, res) {
  res.set('X-Client-IP', req.ip);
  res.hal(endpoint);
});

module.exports = router;
