'use strict';

var request = require('request'),
    logger = require('../logger'),
    errors = require('../../errors'),
    Big = require('big.js'),
    OrionHelper = require('fiware-orion-client').NgsiHelper,
    moment = require('moment'),
    objectAdaptors = require('./utils/objectAdaptors');

var CITY_EVENT = 'CityEvent';

module.exports = function(config) { //eslint-disable-line no-unused-vars

  return function(cityBrokerInfo, data, type, cb) { //eslint-disable-line no-unused-vars
    //TODO: Server issue? Review it. The return coordinates in the right format in their jsons.
    var coordsArr = data.coords.split(',');
    var coordsStr = coordsArr[1] + ',' + coordsArr[0];

    var options = {
      url: cityBrokerInfo.url,
      qs: {
        center: coordsStr,
        range: (data.radius.div(Big(1000))).toString() || 700,
        key: cityBrokerInfo.key
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'fiware-here-adapter'
      },
      json: true
    };

    if (cityBrokerInfo.poisCat) {
      options.qs.category = cityBrokerInfo.poisCat;
    }

    if (type === CITY_EVENT) {
      options.qs['start_date'] = moment().format('YYYY-MM-DD'); //eslint-disable-line dot-notation
    }

    logger.info('Current Options: %s', JSON.stringify(options));
    request.get(options, function(err, response, body) {
      if (err) {
        return cb(errors.NGSI_BACKEND_ERROR(err.message));
      }
      if (!body) {
        return cb(errors.NGSI_BACKEND_ERROR('Body is not valid'));
      }
      if (response.statusCode !== 200) {
        return cb(errors.NGSI_BACKEND_ERROR('HTTP Status Code is not valid:' + JSON.stringify(body)));
      }

      if (body.errorCode) {
        var error = errors.NGSI_BACKEND_BAD_RESPONSE(body.errorCode.reasonPhrase);
        error.status = body.errorCode.code;
        if (body.errorCode.code === '404') {
          return cb(null, []);
        } else {
          return cb(error);
        }
      }
      var parsedBody = OrionHelper.parse(body);
      return cb(null, objectAdaptors(type)(Array.isArray(parsedBody) ? parsedBody : [parsedBody]));
    });

  };

};
