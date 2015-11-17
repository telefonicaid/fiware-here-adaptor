'use strict';

var logger = require('logops');

/**
 * Set up logger to use the context (transactionId, correlator, operation, ...) from domain.
 *
 * @return {Object}
 *    Context with the log entry information except timestamp, level, and message.
 */
logger.getContext = function getDomainContext() {
  return process.domain && process.domain.tracking;
};

logger.formatters.setNotAvailable('NA');

/**
 * The exported API.
 *
 * @type {API|*|exports}
 */
module.exports = logger;
