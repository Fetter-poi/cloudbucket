'use strict';

var hateoas = require('../commons/hateoas');
var Link = hateoas.Link;
var Resource = hateoas.Resource;
var PagedResources = hateoas.PagedResources;

/**
 * @class
 */
function UserResource(user) {
  Resource.call(this, user);
  this.add(new Link('/v1/users/' + user._id, Link.REL_SELF));
}

UserResource.prototype = Object.create(Resource.prototype);

/**
 *
 * @param organizations
 * @param totalElements
 * @param pageRequest
 * @returns {PagedResources}
 */
UserResource.pagedResources = PagedResources.createPagedResources(UserResource, 'users');

module.exports = UserResource;
