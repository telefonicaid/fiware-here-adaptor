'use strict';

var OrionModule = require('fiware-orion-client'),
    logger = require('../logger'),
    queryContext = require('./utils/queryContext'),
    objectAdaptors = require('./utils/objectAdaptors');

module.exports = function(config) {

  var OrionClients = {};

  return function(cityBrokerInfo, data, type, cb) {
    var cityContextBrokerUrl = cityBrokerInfo.url;
    var currentConf = config.cityBrokerDirectoryConfig;
    currentConf.url = cityContextBrokerUrl;

    var OrionClient;
    if (OrionClients[cityContextBrokerUrl]) {
      OrionClient = OrionClients[cityContextBrokerUrl];
    } else {
      OrionClient = new OrionModule.Client(currentConf);
      OrionClients[cityContextBrokerUrl] = OrionClient;
    }

    data.conditions = data.conditions || {};

    var geoQuery = {
      type: cityBrokerInfo.entity
    };
    var options = {
      location: {
        coords: data.coords,
        geometry: data.geometry,
        radius: data.radius.toString() || 700
      }
    };
    //TODO: Aveiro Issue, change this when Aveiro server runs as we expect.
    if (cityBrokerInfo.geo === 'false') {
      options = {};
    }
    if (cityBrokerInfo.id) {
      geoQuery.id = cityBrokerInfo.id;
    }

    if (cityBrokerInfo.pattern) {
      geoQuery.pattern = cityBrokerInfo.pattern;
    }

    logger.info('Getting City context broker info for: %s, %j', cityBrokerInfo.entity, options);
    queryContext(OrionClient, geoQuery, options, function(err, contextData) {
      if (!err && !contextData) {
        return cb(null, []);
      }
      return cb(err, objectAdaptors(geoQuery.type)(Array.isArray(contextData) ? contextData : [contextData]));
    });
  };

};
