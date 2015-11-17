'use strict';

var async = require('async'),
    HereService = require('./here'),
    _ = require('lodash'),
    logger = require('../services/logger'), //eslint-disable-line no-unused-vars
    OrionService = require('./orion'),
    Ngsi10Service = require('./ngsi10');

var PARKING = 'Parking';
var PARKING_LOT = 'ParkingLot';
var STREET_PARKING = 'StreetParking';

module.exports = function(config) {

  var here = HereService(config);
  var orion = OrionService(config);
  var ngsi10 = Ngsi10Service(config);

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
          data.type.forEach(function(type) {
            var cityBrokerInfo = cityContextBrokerDirectory.cityBrokers[type];
            if (cityBrokerInfo) {
              var hostType = cityBrokerInfo.type;
              if (hostType === 'orion') {
                functionArray.push(
                    function(callbackInt) {
                      orion.getCityContextBrokerInfo(cityBrokerInfo, data, type, callbackInt);
                    }
                );
              } else if (hostType === 'ngsi10') {
                functionArray.push(
                    function(callbackInt) {
                      ngsi10.getCityContextBrokerInfo(cityBrokerInfo, data, type, callbackInt);
                    }
                );
              }
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

  return {
    getCarNavigatorInfo: getCarNavigatorInfo,
    getCityCenterCoords: getCityCenterCoords
  };

};
