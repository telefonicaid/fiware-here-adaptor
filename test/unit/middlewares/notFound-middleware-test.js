'use strict';


describe('Not Found Middleware Tests', function() {

  it('should call next function with NOT_FOUND error', function() {
    var next = function(err) {
      expect(err).to.exist;
      expect(err.name).to.be.equal('NOT_FOUND');
      expect(err.message).to.be.equal('Resource not found');
    };
    var notFoundMiddleware = require('../../../lib/middlewares/notFoundMiddleware');
    notFoundMiddleware(null, null, next);
  });

});

