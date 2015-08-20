'use strict';

var hateoas = require('../commons/hateoas');
var Link = hateoas.Link;
var Resource = hateoas.Resource;
var PagedResources = hateoas.PagedResources;

/**
 * @class
 */
function FileResource(item) {
  Resource.call(this, item);
  this.add(new Link('/v1/files/' + item._id, Link.REL_SELF));
}

FileResource.prototype = Object.create(Resource.prototype);

/**
 *
 * @param organizations
 * @param totalElements
 * @param pageRequest
 * @returns {PagedResources}
 */
FileResource.pagedResources = PagedResources.createPagedResources(FileResource, 'files');

module.exports = FileResource;
