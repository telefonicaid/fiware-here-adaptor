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
    console.log('City Broker Info: ', JSON.stringify(cityBrokerInfo));
    console.log('Current Conf: ', JSON.stringify(currentConf));

    var OrionClient;
    if (OrionClients[cityContextBrokerUrl]) {
      OrionClient = OrionClients[cityContextBrokerUrl];
    } else {
      var clientParams = JSON.parse(JSON.stringify(currentConf));
      clientParams.service = cityBrokerInfo.service;
      OrionClient = new OrionModule.Client(clientParams);
      OrionClients[cityContextBrokerUrl] = OrionClient;
    }
    
    console.log('Config: ', JSON.stringify(OrionClient));

    data.conditions = data.conditions || {};

    var geoQuery = {
      type: cityBrokerInfo.entity
    };
    var options = {
      location: {
        coords: data.coords,
        geometry: data.geometry,
      },
      limit: 70
    };
    
    if (data.geometry === 'Circle') {
      options.location.radius = parseInt(data.radius, 10) || 700
    }
    
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
    
    if (cityBrokerInfo.servicePath) {
      options.path = cityBrokerInfo.servicePath;
    }
    
    console.log('Orion Client: ', JSON.stringify(OrionClient));

    logger.info('Getting City context broker info for: %s, %j', cityBrokerInfo.entity, options);
    queryContext(OrionClient, geoQuery, options, function(err, contextData) {
      if (!err && !contextData) {
        return cb(null, []);
      }
      // Filtering Street parking manually
      if (cityBrokerInfo.entity === 'StreetParking') {
        var data = Array.isArray(contextData) ? contextData : [contextData];
        var filtered = data.filter(function(aElement) {
          return aElement.availableSpotNumber > 0;
        });
        contextData = filtered;
      }
      
      // Filtering ambient data accordingly
      if (cityBrokerInfo.entity === 'EnvironmentEvent') {
        var data = Array.isArray(contextData) ? contextData : [contextData];
        var filtered = data.filter(function(aElement) {
          return aElement['nitrogen_dioxide'] || aElement['carbon_monoxide'] || aElement['ozone'] ||
            typeof aElement['temperature'] == 'number' ||
            typeof aElement['humidity'] == 'number' ||
            typeof aElement['noise_level'] == 'number'
        });
        var mapped = filtered.map(function(aElement) {
          aElement.id = 'Porto' + '-' + 'AmbientObserved' + '-' + aElement.id;
          return aElement;
        });
        contextData = mapped;
      }
      
      return cb(err, objectAdaptors(geoQuery.type)(Array.isArray(contextData) ? contextData : [contextData]));
    });
  };

};

