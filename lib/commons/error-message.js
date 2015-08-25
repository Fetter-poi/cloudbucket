'use strict';

var http = require('http');
/**
 * @class
 * @param {(string|Error|HttpStatus)} error
 * @param {number|HttpStatus=} status
 * @example new ErrorMessage(new Error('Bad thing'));
 * @example new ErrorMessage('Bad thing', 400);
 * @example new ErrorMessage(400);
 */
function ErrorMessage(error, status, errors) {
  var message = error || http.STATUS_CODES['500'];
  var stack = error ? error.stack || null : null;
  if (http.STATUS_CODES[error.toString()]) {
    message = http.STATUS_CODES[error.toString()];
    errors = status;
    status = Number(error);
  } else {
    if (error instanceof Error) {
      message = error.message;
    }
    if (status && http.STATUS_CODES[status.toString()]) {
      status = Number(status);
    }
  }
  status = status || 500;

  /**
   *
   * @type {string}
   * @default "Internal Server Error"
   */
  this.message = message;

  /**
   *
   * @type {number}
   */
  this.timestamp = Date.now();

  /**
   *
   * @type {number}
   */
  this.status = status;

  if (stack && process.env.NODE_ENV !== 'production') {
    /**
     *
     * @type {string=}
     */
    this.stack = stack;

  }

  if (errors) {
    /**
     *
     * @type {Object=}
     */
    this.errors = errors;
  }


}

module.exports = ErrorMessage;



