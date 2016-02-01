'use strict';

var pointer = require('json-pointer'),
    logger = require('../../logger');
    
function ppm2micrograms(pollutant, value) {
  var out = value;
  
  switch (pollutant) {
    case 'CO':
      out = Math.round(value * 1.1642 * 1000)
      break;
  }
  
  return out;
}

function ppb2micrograms(pollutant, value) {
  var out = value;
  
  switch (pollutant) {
    case 'O3':
      out = Math.round(value * 1.9957)
      break;
    case 'NO2':
      out = Math.round(value * 1.9125)
      break;
    case 'SO2':
      out = Math.round(value * 2.6609)
      break;
  }
  
  return out;
}

var environmentRules = [
  {origin: '/coordinates',      destination: '/location'},
  {origin: '/carbon_monoxide',  destination: '/pollutants/CO/concentration',
                                                    modifier: ppm2micrograms.bind(null, 'CO') },
  {origin: '/humidity',         destination: '/relativeHumidity'},
  {origin: '/nitrogen_dioxide', destination: '/pollutants/NO2/concentration',
                                                    modifier: ppb2micrograms.bind(null, 'NO2') },
  {origin: '/noise_level', destination: '/noiseLevel'},
  {origin: '/ozone', destination: '/pollutants/O3/concentration',
                                                    modifier: ppb2micrograms.bind(null, 'O3') },
  {destination: '/pollutants/O3/description', default:'Ozone', relativeToProperty: '/ozone'},
  {destination: '/pollutants/NO2/description', default:'Nitrogen Dioxide', relativeToProperty: '/nitrogen_dioxide'},
  {destination: '/pollutants/CO/description', default:'Carbon Monoxide', relativeToProperty: '/carbon_monoxide'},
  {origin: '/processed_nitrogen_dioxide', destination: null},
  {origin: '/processed_ozone', destination: null},
  {origin: '/temperature', destination: '/temperature'},
  {origin: '/timestamp', destination: '/created'},
  {destination: '/type', default: 'AmbientObserved'},
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
  {origin: '/position', destination: '/location'},
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
/*  {origin: '/id', destination: '/name'},*/
  {origin: '/name', destination: '/name'},
  /*
  {destination: '/closingTime', default: '23:00'},
  {destination: '/openingTime', default: '06:30'},
  {destination: '/metered', default: false},
  {destination: '/maximumAllowedDuration', default: 480},
  {destination: '/pricePerMinute', default: 0},
  {destination: '/probabilityOfSpotFinding', default: 1} */
]);

var adaptEvent = function adaptEvent(eventArray, rules) {
  var results = [];
  if (eventArray && eventArray.length > 0) {
    eventArray.forEach(function(event) {
      var result = {};
      rules.forEach(function(rule) {
        if (typeof rule.origin == 'undefined') { //eslint-disable-line eqeqeq
          if (!rule.relativeToProperty) {
            pointer.set(result, rule.destination, rule.default); 
          }
          else {
            var hasToBeSet = true;
            try {
              pointer.get(event, rule.relativeToProperty);
            }
            catch(err) { hasToBeSet = false; }
            if (hasToBeSet) {
              pointer.set(result, rule.destination, rule.default);
            } 
          }
        } else {
          try {
            var value = pointer.get(event, rule.origin);
            if (typeof value == 'undefined' || value === null) { //eslint-disable-line eqeqeq
              if (typeof rule.default != 'undefined') { //eslint-disable-line eqeqeq
                value = rule.default;
              }
            }
            
            if (rule.modifier) {  
              value = rule.modifier(value);
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
  console.log('This is the type: ', type);
  
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
