'use strict';

var async = require('async'),
    HereService = require('./here'),
    _ = require('lodash'),
    logger = require('../services/logger'), //eslint-disable-line no-unused-vars
    OrionService = require('./orion'),
    Ngsi10Service = require('./ngsi10'),
    Ngsiv2Service = require('./ngsiv2');

var PARKING = 'Parking';
var PARKING_LOT = 'ParkingLot';
var STREET_PARKING = 'StreetParking';

module.exports = function(config) {

  var here = HereService(config);
  var orion = OrionService(config);
  var ngsi10 = Ngsi10Service(config);
  var ngsiv2 = Ngsiv2Service(config);

  var getCarNavigatorInfo = function getCarNavigatorInfo(data, cb) {
    if (!data.type) {
      data.type = [PARKING_LOT, STREET_PARKING];
    }
    if (data.type.length === 0) {
      data.type = [PARKING_LOT, STREET_PARKING];
    }

    if (data.type.length >= 1) {
      if (_.indexOf(data.type, PARKING) >= 0) {
        data.type.push(PARKING_LOT);
        data.type.push(STREET_PARKING);
        _.remove(data.type, function(n) {
          return n === PARKING;
        });
      }
      data.type = _.uniq(data.type);
    }

    async.waterfall([
      function searchCityByCoords(callback) {
        here.searchCityByCoords(data.coords, callback);
      },
      here.getCoordsByCityInfo,
      orion.getCityContextBrokerFromDirectory,
      function getCityContextBrokerInfo(cityContextBrokerDirectory, callback) {
        var functionArray = [function(callbackInt) { return callbackInt(null, []); }];
        if (cityContextBrokerDirectory) {
          data.type.forEach(function(entityType) {
            var cityBrokerInfo = cityContextBrokerDirectory.cityBrokers[entityType];
            if (cityBrokerInfo) {
              var hostType = cityBrokerInfo.type;
              var functionToExecute = Object.create(null);
              
              if (hostType === 'orion') {
                functionToExecute['orion'] = 
                    function(callbackInt) {
                      orion.getCityContextBrokerInfo(cityBrokerInfo, data, entityType, callbackInt);
                    }
              } else if (hostType === 'ngsi10') {
                 functionToExecute['ngsi10'] =
                    function(callbackInt) {
                      ngsi10.getCityContextBrokerInfo(cityBrokerInfo, data, entityType, callbackInt);
                    }
              }
              else if (hostType === 'ngsiv2') {
                functionToExecute['ngsiv2'] =
                    function(callbackInt) {
                      ngsiv2.getCityContextBrokerInfo(cityBrokerInfo, data, entityType, callbackInt);
                    }
              }
              
              console.log('Payment: ', JSON.stringify(cityBrokerInfo));
              
              if (cityBrokerInfo.payment && cityBrokerInfo.payment === 'true') {
                var originalFunction = functionToExecute[hostType];
                
                var modifiedFunction = function(callbackInt) {
                  console.log('Modified function!!!!!');
                  
                  getPurchasedDatasets(null, function(err, data) {
                    var out = data.filter(function(aElement) {
                      return (aElement.entityType == entityType &&
                              aElement.endPoint.indexOf(cityBrokerInfo.url) !== -1);
                    });
                    if (out.length > 0) {
                      console.log('Original!!');
                      originalFunction(callbackInt);
                    }
                    else {
                      callbackInt(null, []);
                    }
                  });
                }
                
                functionToExecute[hostType] = modifiedFunction;
              }
              
              functionArray.push(functionToExecute[hostType]);
            }
          });
        }
        async.parallel(functionArray, function(err, result) {
          callback(err, _.flatten(result));
        });
      }
    ], cb);
  };

  var getCityCenterCoords = function getCityCenterCoords(data, cb) {
    async.waterfall([
      function searchCityByCoords(callback) {
        here.searchCityByCoords(data.coords, callback);
      },
      here.getCoordsByCityInfo
    ], cb);
  };

  var getPurchasedDatasets = function(user, cb) {
    cb(null, [{
      'entityType': 'GasStation',
      'endPoint':   'https://api.ost.pt/ngsi10/contextEntityTypes/pois/?category=417&municipality=806&key=hackacityporto2015_browser'
    }]);
  }
  
  return {
    getCarNavigatorInfo: getCarNavigatorInfo,
    getCityCenterCoords: getCityCenterCoords
  };

};
