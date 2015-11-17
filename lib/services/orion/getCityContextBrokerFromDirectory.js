'use strict';

var OrionModule = require('fiware-orion-client'),
    logger = require('../logger'),
    queryContext = require('./utils/queryContext');

module.exports = function(config) {
  var OrionClient = new OrionModule.Client(config.cityBrokerDirectoryConfig);

  return function(coords, cb) {
    var geoQuery = {
      type: config.cityContextBrokerDirectoryName
    };
    var options = {
      location: {
        coords: coords,
        geometry: 'Circle',
        radius: config.maxDistanceCityDirectory
      }
    };
    logger.info('Getting CityBroker from directory.');
    queryContext(OrionClient, geoQuery, options, cb);
  };

};
