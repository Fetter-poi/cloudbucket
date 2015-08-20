'use strict';

/**
 * @module halMiddleware
 */


var url = require('url');
var Qs = require('qs');
var _ = require('lodash');
var hateoas = require('../commons/hateoas');
var Resource = hateoas.Resource;
var Resources = hateoas.Resources;
var PagedResources = hateoas.PagedResources;
var Link = hateoas.Link;

module.exports = function (req, res, next) {

  function writeLink(link) {
    var l = {};
    //var hrefPrefix = (/^\//.test(link.href) ? req.serverUrl : '');
    l.href = link.href;
    if (link.template.varNames.length) {
      l.templated = true;
      var queryParams = Qs.parse(url.parse(link.href).query);
      var missingVarNames = [];
      link.template.varNames.forEach(function (varName) {
        if (!queryParams.hasOwnProperty(varName)) {
          missingVarNames.push(varName);
        }
      });
      if (missingVarNames.length) {
        var symbol = _.isEmpty(queryParams) ? '?' : '&';
        l.href += '{' + symbol + missingVarNames.join(',') + '}';
      }
    }

    return l;
  }

  function writeResource(resource) {
    var obj = {};
    if (resource instanceof Resource && resource.content) {
      obj = resource.content;
    }
    obj._links = {};
    if (resource.links) {
      resource.links.forEach(function (link) {

        obj._links[link.rel] = writeLink(link);
      });
    }
    return obj;
  }

  res.hal = function (resource) {
    var obj = writeResource(resource);
    if (resource instanceof Resources) {
      obj._embedded = {};
      if (resource.content) {
        if (_.isArray(resource.content)) {
          obj._embedded.entities = resource.content.map(writeResource);
        } else {
          for (var rel in resource.content) {
            if (rel !== '_links') {
              obj._embedded[rel] = resource.content[rel].map(writeResource);
            }
          }
        }
      }
    }
    if (resource instanceof PagedResources) {
      obj._page = resource.metadata;
      if (resource.hasLink(Link.REL_NEXT)) {
        obj._links.next = writeLink(resource.nextLink());
      }
      if (resource.hasLink(Link.REL_PREVIOUS)) {
        obj._links.prev = writeLink(resource.previousLink());
      }
    }
    if (/node-superagent/.test(req.headers['user-agent'])) {
      res.json(obj);
    } else {
      res.set('content-type', 'application/hal+json');
      res.send(obj);
    }
  };

  next();
};
