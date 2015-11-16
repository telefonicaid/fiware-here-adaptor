'use strict';

var express = require('express'),
    logger = require('../services/logger'), //eslint-disable-line no-unused-vars
    SchemaValidator = require('is-my-json-valid/require'),
    CarNavigatorService = require('../services/carNavigatorService'),
    Big = require('big.js');

function routes(config) {
  var carNavigator = CarNavigatorService(config);
  var router = express.Router();

  router.get('/v2/entities', function(req, res, next) { //eslint-disable-line no-unused-vars
    var data = req.query;

    var validateParams = SchemaValidator('../schemas/queryParams.json');
    if (!validateParams(data)) {
      logger.info('Invalid query: %j', validateParams.errors);
      return res.status(400).json({error: 'Bad request. Query ' + validateParams.errors});
    }
    if (!data.type) {
      data.type = [];
    } else {
      data.type = data.type.split(',');
    }
    data.radius = Big(data.radius);
    carNavigator.getCarNavigatorInfo(data, function(err, result) {
      if (err) {
        if (err.name === 'HERE_BACKEND_BODY_ERROR') {
          return res.json(result || []);
        }
        return next(err);
      }
      return res.json(result);
    });

  });

  router.get('/getCenterCoords', function(req, res, next) {//eslint-disable-line no-unused-vars
    var data = req.query;
    carNavigator.getCityCenterCoords(data, function(err, result) {
      if (err) {
        return next(err);
      }
      return res.json(result);
    });
  });
  return router;
}

module.exports = routes;
