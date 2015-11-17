'use strict';

var errors = require('../errors');

/**
 * Not Found middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
module.exports = function(req, res, next) {
  next(errors.NOT_FOUND());
};
