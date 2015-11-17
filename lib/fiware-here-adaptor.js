'use strict';

var express = require('express'),
    expressDomain = require('express-domaining'),
    expressTracking = require('express-tracking'),
    expressLogging = require('express-logging'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    http = require('http'),
    path = require('path'),
    httpAgent = require('http-pooling-agent'),
    Configuration = require('merge-config'),
    ValidateConfig = require('is-my-json-valid/require'),
    notFoundMiddleware = require('./middlewares/notFoundMiddleware'),
    errorMiddleware = require('./middlewares/errorMiddleware'),
    routes = require('./routes'),
    logger = require('./services/logger');

// Default logging level. It can be overridden by configuration.
logger.setLevel('INFO');

// Configuration is composed by merging the JSON files from a directory (process.env.CONFIG_DIR) and from
// the default configuration (./config/config.json).
// Note that the directory is optional, but if present, it overrides the default configuration.
var config = new Configuration();
try {
  if (process.env.CONFIG_DIR) {
    config.file(process.env.CONFIG_DIR);
  }
  config.file(path.join(__dirname, 'config', 'config.json'));
} catch (e) {
  logger.fatal(e.message);
  process.exit(1); //eslint-disable-line no-process-exit
}

// Validate configuration with JSON schema
var validateConfig = ValidateConfig('./schemas/config.json');
if (!validateConfig(config.get())) {
  logger.fatal('Invalid configuration: %j', validateConfig.errors);
  process.exit(1); //eslint-disable-line no-process-exit
}

// Update logging level (just in case configuration has changed it)
logger.setLevel(config.get('logLevel'));
// Set log format
logger.format = logger.formatters[config.get('logFormat')];
logger.debug('Merged configuration: %j', config.get());

// Allow unauthorized SSL if gentleSsl is true
if (config.get('gentleSsl')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}

// Set custom agent as default HTTP agent
http.Agent = httpAgent.Agent;
http.globalAgent = new httpAgent.Agent();

var app = express();
app.use(expressDomain(logger));
app.use(expressTracking({op: 'fiware-here-adaptor'}));
app.use(expressLogging(logger));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(routes(config.get()));
app.use(notFoundMiddleware);
app.use(errorMiddleware);

function onServerListening() {
  logger.info('Listening at port', config.get('serverPort'));
}

function onServerClose() {
  logger.warn('Server closed');
}

var server = http.createServer(app).listen(config.get('serverPort'))
    .once('listening', onServerListening)
    .once('close', onServerClose);

function orderedShutdown() {
  logger.debug('ordered shutdown');
  if (server) {
    server.close(function onClose() {
      process.exit(0); //eslint-disable-line no-process-exit
    });
  }
}

process.on('SIGTERM', orderedShutdown);
process.on('SIGINT', orderedShutdown);

/**
 * The exported API
 * @type {*}
 */
module.exports = app;
