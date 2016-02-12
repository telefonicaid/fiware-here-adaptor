'use strict';

var pointer = require('json-pointer'),
    logger = require('../../logger'),
    helperFunctions = require('./helperFunctions');

var CITY_EVENT  = 'CityEvent';
var PARKING_LOT = 'ParkingLot';
var GARAGE      = 'Garage';
var GAS_STATION = 'GasStation';

var parkingRules = [
  {origin: '/geom_feature', destination: '/location'},
  {destination: '/closingTime', default: '23:00'},
  {destination: '/openingTime', default: '06:30'},
  {destination: '/metered', default: false},
  {destination: '/maximumAllowedDuration', default: 480},
  {destination: '/totalSpotNumber', func: helperFunctions.randomIntInc, arg: [300, 500]},
  {destination: '/availableSpotNumber', func: helperFunctions.randomIntInc, arg: [100, 200]},
  {destination: '/extraSpotNumber', default: 1},
  {destination: '/pricePerMinute', default: 0},
  {destination: '/allowedVehicles', default: ['Car', 'Bicycle', 'MotorBike']},
  {destination: '/probabilityOfSpotFinding', default: 1},
  {destination: '/parkingDisposition', default: 'Parallel'},
  {origin: '/name', destination: '/name'},
  {origin: '/metadata/description/eng', destination: '/description'},
  {destination: '/entrances', default: '[]'},
  {destination: '/exits', default: '[]'},
  {destination: '/averageSpotWidth', default: 255},
  {destination: '/averageSpotLength', default: 543},
  {destination: '/userRating', default: 5},
  {destination: '/type', default: 'ParkingLot'},
  {origin: '/id', destination: '/id'}
];

var cityEventRules = [
  {origin: '/geom_feature', destination: '/location'},
  {origin: '/location', destination: '/street'},
  {destination: '/type', default: 'CityEvent'},
  {origin: '/id', destination: '/id'},
  {origin: '/metadata/theme/eng', destination: '/theme'},
  {origin: '/metadata/target/eng', destination: '/target'},
  {origin: '/name', destination: '/name'},
  {origin: '/metadata/schedule/eng', destination: '/schedule'},
  {origin: '/metadata/promoter/eng', destination: '/promoter'},
  {origin: '/start_time', destination: '/start_time'},
  {origin: '/end_time', destination: '/end_time'}
];

var gasStationRules = [
  { origin: '/geom_feature', destination: '/location' },
  { destination: '/type', default: 'GasStation' },
  { origin: '/id', destination: '/id' },
  { origin: '/name', destination: '/name' }
];

var garageRules = [
  { origin: '/geom_feature', destination: '/location' },
  { destination: '/type', default: 'Garage' },
  { origin: '/id', destination: '/id' },
  { origin: '/name', destination: '/name' }
];

var adaptEvent = function adaptEvent(eventArray, rules) {
  var results = [];
  if (eventArray && eventArray.length > 0) {
    eventArray.forEach(function(event) {
      var result = {};
      rules.forEach(function(rule) {
        if (typeof rule.origin == 'undefined') { //eslint-disable-line eqeqeq
          if (typeof rule.default != 'undefined') { //eslint-disable-line eqeqeq
            pointer.set(result, rule.destination, rule.default);
          } else if (typeof rule.func == 'function') { //eslint-disable-line eqeqeq
            pointer.set(result, rule.destination, rule.arg ? rule.func(rule.arg) : rule.func());
          }
        } else {
          try {
            var value = pointer.get(event, rule.origin);
            if (typeof value == 'undefined' || value === null) { //eslint-disable-line eqeqeq
              if (typeof rule.default != 'undefined') { //eslint-disable-line eqeqeq
                value = rule.default;
              } else if (typeof rule.func == 'function') { //eslint-disable-line eqeqeq
                value = rule.arg ? rule.func(rule.arg) : rule.func;
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

var takeOneOfEachPromoter = function(eventResults) {
  var counter = {};
  var results = [];
  if (eventResults && eventResults.length > 0) {
    eventResults.forEach(function(event) {
      var promoter = event.promoter;
      if (promoter) {
        if (!counter[promoter]) {
          counter[promoter] = 1;
          results.push(event);
        } else {
          if (counter[promoter] < 1) {
            counter[promoter]++;
            results.push(event);
          }
        }
      } else {
        results.push(event);
      }
    });
  }
  return results;
};

var adaptEventWrapper = function adaptEventWrapper(rules, type) {
  return function(eventArray) {
    if (type === CITY_EVENT) {
      var eventResults = adaptEvent(eventArray, rules);
      return takeOneOfEachPromoter(eventResults);
    } else {
      return adaptEvent(eventArray, rules);
    }

  };
};

module.exports = function(type) {
  switch (type)
  {
    case PARKING_LOT:
      logger.info('Adapting parking Lot structure');
      return adaptEventWrapper(parkingRules, type);
    case CITY_EVENT:
      logger.info('Adapting city events structure');
      return adaptEventWrapper(cityEventRules, type);
    case GARAGE:
      logger.info('Adapting garage structure');
      return adaptEventWrapper(garageRules, type);
    case GAS_STATION:
      logger.info('Adapting gas station structure');
      return adaptEventWrapper(gasStationRules, type);
    default:
      logger.info('No adaptation');
      return function(objectArray) { return objectArray; };
  }
};
