'use strict';

var cluster = require('cluster'),
    logger = require('./services/logger'),
    os = require('os');

/**
 * Cluster module main function.
 * @param {string} workerModule server starting module.
 */
module.exports = function(workerModule) {
  var cores = process.env.CONFIG_CORES || os.cpus().length;

  if (cores != parseInt(cores, 10) || cores < 1) { //eslint-disable-line eqeqeq
    logger.fatal('Environment variable CONFIG_CORES must be a positive integer');
    process.exit(1);//eslint-disable-line no-process-exit
  }

  // Start up the master or the worker
  if (cluster.isMaster) {
    for (var i = 0; i < cores; i++) {
      cluster.fork();
    }
    cluster.on('exit', function(worker, code) {
      if (code !== 1) {
        logger.error('Reforking worker with pid: %d', worker.process.pid);
        cluster.fork();
      }
    });
  } else {
    require(workerModule);
  }
};
