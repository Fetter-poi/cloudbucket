'use strict';

/**
 * @module paging
 */

/** @require lodash */
var _ = require('lodash');

/**
 * @param {string} property
 * @param {boolean=} direction true for ascending, false for descending
 * @constructor
 */
function Order(property, direction) {
  if (_.isUndefined(direction)) {
    direction = true;
    if (/^-/.test(property)) {
      property = property.substring(1);
      direction = false;
    }
  }

  /**
   *
   * @type {string}
   */
  this.property = property;

  /**
   *
   * @type {boolean}
   */
  this.direction = direction;
}

Order.prototype.toString = function () {
  return (this.direction ? '' : '-') + this.property;
};


exports.Order = Order;

/**
 *
 * @param {Array} orders
 * @constructor
 */
function Sort(orders) {
  if (_.isString(orders)) {
    orders = orders.split(',').map(function (property) {
      return new Order(property);
    });
  }

  /**
   *
   * @type {Array}
   */
  this.orders = orders || [];
}

Sort.prototype.toString = function () {
  return this.orders.map(function (order) {
    return order.toString();
  }).join(' ');
};


/**
 *
 * @type {Sort}
 */
exports.Sort = Sort;

/**
 *
 * @param page
 * @param size
 * @param sort
 * @constructor
 */
function PageRequest(page, size, sort) {
  if (page < 0) {
    throw new Error('Page index must not be less than zero!');
  }
  if (size < 0) {
    throw new Error('Page size must not be less than one!');
  }
  /**
   * @type {number}
   */
  this.page = page;

  /**
   * @type {number}
   */
  this.size = size;

  if (sort && !(sort instanceof Sort)) {
    sort = new Sort(sort);
  }

  /**
   *
   * @type {Sort}
   */
  this.sort = sort || null;
}

/**
 *
 * @returns {number}
 */
PageRequest.prototype.getOffset = function () {
  return this.page * this.size;
};


/**
 * It's an alias of `getOffset`
 * @type {Function}
 */
PageRequest.prototype.skip = PageRequest.prototype.getOffset;

/**
 *
 * @returns {number}
 */
PageRequest.prototype.limit = function () {
  return this.size;
};

/**
 *
 * @returns {boolean}
 */
PageRequest.prototype.hasPrevious = function () {
  return this.page > 0;
};

/**
 *
 * @returns {PageRequest}
 */
PageRequest.prototype.previousOrFirst = function () {
  return this.hasPrevious() ? this.previous() : this.first();
};

/**
 *
 * @returns {PageRequest}
 */
PageRequest.prototype.next = function () {
  return new PageRequest(this.page + 1, this.size, this.sort);
};

/**
 *
 * @returns {PageRequest}
 */
PageRequest.prototype.previous = function () {
  return this.page === 0 ? this : new PageRequest(this.page - 1, this.size, this.sort);
};

/**
 *
 * @returns {PageRequest}
 */
PageRequest.prototype.first = function () {
  return new PageRequest(0, this.size, this.sort);
};

/**
 *
 * @param req
 * @returns {PageRequest}
 */
PageRequest.parseRequest = function (req) {
  var page = Number(req.query.page) || 0;
  var size = Number(req.query.size) || 20;
  var sort = req.query.sort;
  return new PageRequest(page, size, sort);
};

/**
 *
 * @type {PageRequest}
 */
exports.PageRequest = PageRequest;

/**
 * Middleware for parsing PageRequest metadata from request. The result is then available on `req.pageRequest`
 * @param req
 * @param res
 * @param next
 */
exports.parseRequest = function (req, res, next) {
  req.pageRequest = PageRequest.parseRequest(req);
  next();
};
