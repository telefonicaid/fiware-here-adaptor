'use strict';

var fs = require('fs'),
    path = require('path'),
    logger = require('../logger');

module.exports = function(config) {

  var ngsi10Requests = {};
  var suffix = '.js';
  fs.readdirSync(__dirname).forEach(function(filename) {
    if (filename.indexOf(suffix, filename.length - suffix.length) !== -1) {
      var name = path.basename(filename, '.js');
      if (name !== 'index') {
        ngsi10Requests[name] = require(path.join(__dirname, filename))(config);
      }
    }
  });

  logger.info('Ngsi10 api integrations loaded');
  return ngsi10Requests;
};
