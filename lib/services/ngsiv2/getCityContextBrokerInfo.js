'use strict';

var request = require('request'),
    logger = require('../logger'),
    errors = require('../../errors'),
    objectAdaptors = require('./utils/objectAdaptors');



module.exports = function(config) { //eslint-disable-line no-unused-vars

  return function(cityBrokerInfo, data, type, cb) { //eslint-disable-line no-unused-vars
    console.log('NGSIv2 service', JSON.stringify(cityBrokerInfo));
    
    //TODO: Server issue? Review it. The return coordinates in the right format in their jsons.
    var coordsArr = data.coords.split(',');
    var coordsStr = coordsArr[1] + ',' + coordsArr[0];

    var q = cityBrokerInfo.q;
    var query = [];
    Object.keys(q).forEach(function(aKey) {
      query.push(aKey + ':' + q[aKey])
    });
    
    var qStr = query.join(';');
    
    var finalUrl = cityBrokerInfo.url + '?type=' + cityBrokerInfo.entity + '&' + 'q=' + qStr;
    console.log('Final URL: ', finalUrl);
    
    var options = {
      url: finalUrl,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'fiware-here-adapter'
      }
    };

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
      var parsedBody = JSON.parse(body);
      return cb(null, parsedBody);
    });

  };

};
