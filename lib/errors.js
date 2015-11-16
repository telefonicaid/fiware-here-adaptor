'use strict';

var therror = require('therror'),
    logger = require('./services/logger');

therror.on('create', function onError(err) {
  logger[err.level || 'info']('ERROR: %s', err.toString());
});

/**
 * Exporting the errors.
 *
 * @type {Object}
 */
module.exports = therror.register({
  NOT_FOUND: {
    message: 'Resource not found',
    level: 'info',
    status: 404
  },
  SYNTAX_ERROR: {
    message: 'Invalid data format.',
    level: 'info',
    status: 400
  },
  HERE_BACKEND_ERROR: {
    message: 'HERE backend error: {1}',
    level: 'error',
    status: 500
  },
  HERE_BACKEND_BODY_ERROR: {
    message: 'Location not found: {1}',
    level: 'info',
    status: 404
  },
  NGSI_BACKEND_ERROR: {
    message: 'NGSI backend error: {1}',
    level: 'error',
    status: 500
  },
  NGSI_BACKEND_BAD_RESPONSE: {
    message: 'NGSI backend bad response: {1}',
    level: 'info',
    status: 400
  },
  ORION_BACKEND_ERROR: {
    message: 'Orion backend error: {1}',
    level: 'error',
    status: 500
  }

});
