'use strict';

/**
 * @module hateoas
 */

/** @requires url */
var url = require('url');

/** @requires lodash */
var _ = require('lodash');

/** @require UriTemplate */
var uriTemplates = require('uri-templates');

/**
 * Value object for links.
 * @class
 * @param {String} rel
 * @param {String} href
 * @param {String} template
 */

function Link(href, rel, template) {
  this.href = href;
  this.rel = rel;
  this.template = template ?
    uriTemplates(template) :
    uriTemplates(href);
}

/**
 *
 * @returns {string}
 */
Link.prototype.params = function () {
  return this.template.fromUri(this.href);
};

/** @constant {String} */
Link.REL_SELF = 'self';

/** @constant {String} */
Link.REL_FIRST = 'first';

/** @constant {String} */
Link.REL_PREVIOUS = 'prev';

/** @constant {String} */
Link.REL_NEXT = 'next';

/** @constant {String} */
Link.REL_LAST = 'last';

exports.Link = Link;

/**
 * A simple resource wrapping a domain object and adding links to it.
 * @param {Number} size the size of the page
 * @param {Number} page the number of the page (zero-indexed, must be less than totalPages)
 * @param {Number} totalElements the total number of elements available
 * @param {Number=} totalPages
 * @class
 */
function PageMetadata(size, page, totalElements, totalPages) {
  this.size = size;
  this.page = page;
  this.totalElements = totalElements;
  this.totalPages = totalPages || size === 0 ? 0 : Math.ceil(totalElements / size);
}

exports.PageMetadata = PageMetadata;


/**
 * @class
 */
function ResourceSupport() {
  this.links = [];
}

/**
 *
 * @param {Object} link
 */
ResourceSupport.prototype.add = function (link) {
  if (link) {
    if (_.isArray(link)) {
      this.links.push.apply(this.links, link);
    } else {
      this.links.push(link);
    }
  }
};

/**
 *
 * @param {String} rel
 * @returns {Object}
 */
ResourceSupport.prototype.getLink = function (rel) {
  return _.find(this.links, function (link) {
    return link.rel === rel;
  });
};

/**
 *
 * @param  {String} rel
 * @returns {boolean}
 */
ResourceSupport.prototype.hasLink = function (rel) {
  return this.getLink(rel) !== undefined;
};

/**
 *
 * @returns {Object}
 */
ResourceSupport.prototype.getId = function () {
  return this.getLink(Link.REL_SELF);
};


exports.ResourceSupport = ResourceSupport;

/**
 * A simple resource wrapping a domain object and adding links to it.
 * @param {Object=} content
 * @param {Array|Object} links
 * @class
 * @extends {module:hateoas~ResourceSupport}
 */
function Resource(content, links) {
  ResourceSupport.call(this);
  // Transform mongoose objects into plain js object
  if(content && _.isFunction(content.toObject)) {
    content = content.toObject();
  }
  this.content = content || null;
  this.add(links);
}

Resource.prototype = Object.create(ResourceSupport.prototype);

exports.Resource = Resource;

/**
 * General helper to easily create a wrapper for a collection of entities.
 * @param {Object} content
 * @param {Array=} links
 * @class
 * @extends {module:hateoas~ResourceSupport}
 */
function Resources(content, links) {
  ResourceSupport.call(this);
  if(_.isFunction(content.toObject)) {
    content = content.toObject();
  }
  this.content = content;
  this.add(links);
}

Resources.prototype = Object.create(ResourceSupport.prototype);

exports.Resources = Resources;

/**
 *
 * @param content
 * @param metadata
 * @param selfLink
 * @param template
 * @class
 * @extends {module:hateoas~Resources}
 */
function PagedResources(content, metadata, selfLink, template, uriParamsString) {
  if (!content) {
    throw new Error('content missing');
  }
  if (!metadata) {
    throw new Error('metadata missing');
  }
  if (!selfLink) {
    throw new Error('selfLink missing');
  }

  var selfLinkUrl, templateString;

  if (_.isString(selfLink)) {
    selfLinkUrl = selfLink;
  } else {
    selfLinkUrl = selfLink.href;
  }
  uriParamsString = uriParamsString || '{?page,size,sort}';
  templateString = template || url.parse(selfLinkUrl).pathname + uriParamsString;
  template = uriTemplates(templateString);
  selfLink = new Link(selfLinkUrl, Link.REL_SELF, templateString);

  Resources.call(this, content, selfLink);
  this.metadata = metadata;
  this.template = template;

  var selfParams = selfLink.params();
  if (metadata.page < metadata.totalPages - 1) {
    var nextParams = _.clone(selfParams);
    nextParams.page = metadata.page + 1;
    this.add(new Link(template.fillFromObject(nextParams), Link.REL_NEXT));
  }
  if (metadata.page > 0) {
    var previousParams = _.clone(selfParams);
    previousParams.page = metadata.page - 1;
    if (previousParams.page === 0) {
      delete previousParams.page;
    }
    this.add(new Link(template.fillFromObject(previousParams), Link.REL_PREVIOUS));
  }

}

PagedResources.prototype = Object.create(Resources.prototype);


PagedResources.prototype.nextLink = function () {
  return this.getLink(Link.REL_NEXT);
};

PagedResources.prototype.previousLink = function () {
  return this.getLink(Link.REL_PREVIOUS);
};

PagedResources.createPagedResources = function (ResourceImpl, relationName, uriParamString) {
  return function (entitites, totalElements, pageRequest, selfUrl) {

    var resources = entitites.map(function (entity) {
      return new ResourceImpl(entity);
    });
    var content = {};
    content[relationName] = resources;
    return new PagedResources(content,
      new PageMetadata(pageRequest.size, pageRequest.page, totalElements),
      selfUrl, null, uriParamString
    );
  };
};

exports.PagedResources = PagedResources;
