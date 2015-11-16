'use strict';

var fs = require('fs'),
    path = require('path'),
    logger = require('../logger');

module.exports = function(config) {

  var orionRequests = {};
  var suffix = '.js';
  fs.readdirSync(__dirname).forEach(function(filename) {
    if (filename.indexOf(suffix, filename.length - suffix.length) !== -1) {
      var name = path.basename(filename, '.js');
      if (name !== 'index') {
        orionRequests[name] = require(path.join(__dirname, filename))(config.contextBroker);
      }
    }
  });

  logger.info('Orion api integrations loaded');
  return orionRequests;
};
