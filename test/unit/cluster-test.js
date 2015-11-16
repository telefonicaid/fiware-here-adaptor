'use strict';

var proxyquire = require('proxyquire').noCallThru();

describe('Cluster Module Tests', function() {
  var oldProcessExit;

  before(function(done) {
    oldProcessExit = process.exit;
    done();
  });

  it('should fail when cores are negative', function() {
    var cluster = proxyquire('../../lib/cluster', {
      'os': {
        cpus: function() {
          return -1;
        }
      },
      './services/logger': {
        fatal: function(msg) {
          expect(msg).to.be.equal('Environment variable CONFIG_CORES must be a positive integer');
        }
      }
    });

    process.exit = function(code) {
      expect(code).to.be.equal(1);
    };
    cluster('../test/unit/clusterModuleHelper');
  });

  it('should require the workerModule if it is not a master and cores are greater than 0', function() {
    var cluster = proxyquire('../../lib/cluster', {
      'os': {
        cpus: function() {
          return {length: 2};
        }
      },
      './services/logger': {
        fatal: function(msg) {
          expect(msg).to.be.equal('Environment variable CONFIG_CORES must be a positive integer');
        }
      },
      'cluster': {
        isMaster: false
      }
    });

    process.exit = function(code) {
      expect(code).to.be.equal(1);
    };
    cluster('../test/unit/clusterModuleHelper');
  });

  it('should call fork twice if it is master and we have two cores', function() {

    var eventFunction;

    var clusterMock = {
      isMaster: true,
      fork: function() {},
      on: function(eventName, callback) {
        expect(eventName).to.be.equal('exit');
        eventFunction = callback;
      }
    };

    var loggerMock = {
      error: function(msg, data) {
        expect(msg).to.be.equal('Reforking worker with pid: %d');
        expect(data).to.be.equal(123);
      }
    };

    var cluster = proxyquire('../../lib/cluster', {
      'os': {
        cpus: function() {
          return {length: 2};
        }
      },
      './services/logger': loggerMock,
      'cluster': clusterMock
    });


    var forkSpy = sinon.spy(clusterMock, 'fork');
    var clusterOnSpy = sinon.spy(clusterMock, 'on');
    var errorLogSpy = sinon.spy(loggerMock, 'error');

    process.exit = function(code) {
      expect(code).to.be.equal(1);
    };
    cluster('../test/unit/clusterModuleHelper');
    expect(clusterOnSpy).to.have.calledOnce;
    expect(forkSpy).to.have.calledTwice;
    forkSpy.reset();
    var worker = {
      process: {
        pid: 123
      }
    };

    eventFunction(worker, 2);
    expect(forkSpy).to.have.calledOnce;
    expect(errorLogSpy).to.have.calledOnce;

    forkSpy.reset();
    errorLogSpy.reset();

    eventFunction(worker, 1);
    expect(forkSpy).to.not.have.calledOnce;
    expect(errorLogSpy).to.not.have.calledOnce;

  });



  after(function(done) {
    process.exit = oldProcessExit;
    done();
  });

});
