'use strict';

var request = require('request'),
    logger = require('../logger'),
    errors = require('../../errors'),
    pointer = require('json-pointer');

module.exports = function(config) {

  return function(coords, cb) {
    var finalCoords = coords.split(',').slice(0,2).join(',');
    console.log('FINAL coords', finalCoords);
    var options = {
      baseUrl: config.reverseGeocodingUrl,
      url: '/6.2/reversegeocode.json',
      qs: {
        'app_id': config.appId,
        'app_code': config.appCode,
        prox: finalCoords + ',100',
        gen: 9,
        mode: 'retrieveAddresses'
      },
      headers: {
        'Accept': 'application/json'
      },
      json: true
    };

    request.get(options, function(err, response, body) {
      if (err) {
        return cb(errors.HERE_BACKEND_ERROR(err.message));
      }
      if (!body) {
        return cb(errors.HERE_BACKEND_BODY_ERROR('Body is not valid'), []);
      }
      if (response.statusCode !== 200) {
        return cb(errors.HERE_BACKEND_ERROR('HTTP Status Code is not valid:' + JSON.stringify(body)));
      }

      var address;
      try {
        address = pointer.get(body, '/Response/View/0/Result/0/Location/Address');
        if (!address) {
          return cb(errors.HERE_BACKEND_BODY_ERROR('Body is not valid'), []);
        }
      } catch (pointerErr) {
        return cb(errors.HERE_BACKEND_BODY_ERROR('Body is not valid'), []);
      }

      var cityInfo = {
        city: address.City,
        county: address.County,
        country: address.Country
      };

      logger.info('CityInfo %j', cityInfo);
      return cb(null, cityInfo);
    });
  };

};
