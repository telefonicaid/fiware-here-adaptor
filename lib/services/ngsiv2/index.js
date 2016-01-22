'use strict';

var fs = require('fs'),
    path = require('path'),
    logger = require('../logger');

module.exports = function(config) {

  var ngsiv2Requests = {};
  var suffix = '.js';
  fs.readdirSync(__dirname).forEach(function(filename) {
    if (filename.indexOf(suffix, filename.length - suffix.length) !== -1) {
      var name = path.basename(filename, '.js');
      if (name !== 'index') {
        ngsiv2Requests[name] = require(path.join(__dirname, filename))(config);
      }
    }
  });

  logger.info('NGSIv2 API integrations loaded');
  return ngsiv2Requests;
};
