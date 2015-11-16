'use strict';

var errors = require('../errors');

/**
 * Middleware for default errors.
 * @param {Object} err
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
module.exports = function(err, req, res, next) { //eslint-disable-line no-unused-vars
  var error = err;
  if (err instanceof SyntaxError) {
    error = errors.SYNTAX_ERROR();
  }
  return res.status(error.status).json({error: error.name, 'error_description': error.message});
};
