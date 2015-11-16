'use strict';

var request = require('request'),
    logger = require('../logger'),
    errors = require('../../errors'),
    pointer = require('json-pointer');

module.exports = function(config) {

  return function(cityInfo, cb) {

    var qs = {
      'app_id': config.appId,
      'app_code': config.appCode,
      city: cityInfo.city
    };

    if (cityInfo.country) {
      qs.country = cityInfo.country;
    }
    if (cityInfo.county) {
      qs.county = cityInfo.county;
    }

    var options = {
      baseUrl: config.geocodingUrl,
      url: '/6.2/geocode.json',
      qs: qs,
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

      var coords;

      try {
        coords = pointer.get(body, '/Response/View/0/Result/0/Location/NavigationPosition/0');
        if (!coords) {
          return cb(errors.HERE_BACKEND_BODY_ERROR('Body is not valid'), []);
        }
      } catch (pointerErr) {
        return cb(errors.HERE_BACKEND_BODY_ERROR('Body is not valid'), []);
      }

      var coordsStr = coords.Latitude + ',' + coords.Longitude;
      logger.info('CityCoords %s', coordsStr);
      return cb(null, coordsStr);
    });
  };

};
