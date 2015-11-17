'use strict';

var errors = require('../../../errors'),
    logger = require('../../logger');

module.exports = function(OrionClient, geoQuery, options, cb) {
  OrionClient.queryContext(geoQuery, options).then(function(contextData) {
    logger.info('City ContextData: %j', contextData);
    cb(null, contextData);
  }, function(error) {
    cb(errors.ORION_BACKEND_ERROR(error.message));
  });
};
