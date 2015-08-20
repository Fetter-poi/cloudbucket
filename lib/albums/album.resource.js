'use strict';

var hateoas = require('../commons/hateoas');
var Link = hateoas.Link;
var Resource = hateoas.Resource;
var PagedResources = hateoas.PagedResources;

/**
 * @class
 */
function AlbumResource(item) {
  Resource.call(this, item);
  this.add(new Link('/v1/albums/' + item._id, Link.REL_SELF));
}

AlbumResource.prototype = Object.create(Resource.prototype);

/**
 *
 * @param organizations
 * @param totalElements
 * @param pageRequest
 * @returns {PagedResources}
 */
AlbumResource.pagedResources = PagedResources.createPagedResources(AlbumResource, 'albums');

module.exports = AlbumResource;
