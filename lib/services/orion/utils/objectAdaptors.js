'use strict';

var pointer = require('json-pointer'),
    logger = require('../../logger');

var environmentRules = [
  {origin: '/coordinates', destination: '/location'},
  {origin: '/carbon_monoxide', destination: '/carbon_monoxide'},
  {origin: '/humidity', destination: '/humidity'},
  {origin: '/nitrogen_dioxide', destination: '/nitrogen_dioxide'},
  {origin: '/noise_level', destination: '/noise_level'},
  {origin: '/ozone', destination: '/ozone'},
  {origin: '/processed_nitrogen_dioxide', destination: '/processed_nitrogen_dioxide'},
  {origin: '/processed_ozone', destination: '/processed_ozone'},
  {origin: '/temperature', destination: '/temperature'},
  {origin: '/timestamp', destination: '/timestamp'},
  {origin: '/type', destination: '/type'},
  {origin: '/id', destination: '/id'}
];

var trafficRules = [
  {origin: '/coordinates', destination: '/location'},
  {origin: '/date', destination: '/date'},
  {origin: '/distance', destination: '/distance'},
  {origin: '/hdop', destination: '/hdop'},
  {origin: '/latitude', destination: '/latitude'},
  {origin: '/longitude', destination: '/longitude'},
  {origin: '/movement', destination: '/movement'},
  {origin: '/speed', destination: '/speed'},
  {origin: '/vehicle', destination: '/vehicle'},
  {origin: '/type', destination: '/type'},
  {origin: '/id', destination: '/id'}
];

var parkingRules = [
  {origin: '/allowedVehicles', destination: '/allowedVehicles'},
  {origin: '/availableSpotNumber', destination: '/availableSpotNumber'},
  {origin: '/totalSpotNumber', destination: '/totalSpotNumber'},
  {origin: '/location', destination: '/location'},
  {origin: '/id', destination: '/id'},
  {origin: '/parking_disposition', destination: '/parkingDisposition'},
  {origin: '/type', destination: '/type'},
  {origin: '/capacity', destination: '/totalSpotNumber'},
  {origin: '/lastUpdated', destination: '/lastUpdated'},
  {origin: '/updated', destination: '/updated'},
  {origin: '/center', destination: '/centroid'},
  {origin: '/centroid', destination: '/centroid'}
];

var parkingLotRules = parkingRules.slice(0).concat([
  {origin: '/id', destination: '/name'},
  {destination: '/closingTime', default: '23:00'},
  {destination: '/openingTime', default: '06:30'},
  {destination: '/metered', default: false},
  {destination: '/maximumAllowedDuration', default: 480},
  {destination: '/pricePerMinute', default: 0},
  {destination: '/probabilityOfSpotFinding', default: 1}
]);

var adaptEvent = function adaptEvent(eventArray, rules) {
  var results = [];
  if (eventArray && eventArray.length > 0) {
    eventArray.forEach(function(event) {
      var result = {};
      rules.forEach(function(rule) {
        if (typeof rule.origin == 'undefined') { //eslint-disable-line eqeqeq
          pointer.set(result, rule.destination, rule.default);
        } else {
          try {
            var value = pointer.get(event, rule.origin);
            if (typeof value == 'undefined' || value === null) { //eslint-disable-line eqeqeq
              if (typeof rule.default != 'undefined') { //eslint-disable-line eqeqeq
                value = rule.default;
              }
            }
            pointer.set(result, rule.destination, value);
          } catch (err) {
            logger.warn('Key %s not found in the document.', rule.origin);
          }
        }
      });
      results.push(result);
    });
  }
  return results;
};

var adaptEventWrapper = function adaptEventWrapper(rules) {
  return function(eventArray) {
    return adaptEvent(eventArray, rules);
  };
};

module.exports = function(type) {
  switch (type)
  {
    case 'EnvironmentEvent':
      logger.info('Adapting environmentEvent structure');
      return adaptEventWrapper(environmentRules);
    case 'TrafficEvent':
      logger.info('Adapting trafficEvent structure');
      return adaptEventWrapper(trafficRules);
    case 'StreetParking':
      logger.info('Adapting StreetParking structure');
      return adaptEventWrapper(parkingRules);
    case 'ParkingLot':
      logger.info('Adapting ParkingLot structure');
      return adaptEventWrapper(parkingLotRules);
    default:
      logger.info('No adaptation');
      return function(objectArray) { return objectArray; };
  }
};
