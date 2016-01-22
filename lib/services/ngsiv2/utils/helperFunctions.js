'use strict';

module.exports.randomIntInc = function randomIntInc (arg) {
  var high = arg[1] || 100;
  var low = arg[0] || 0;
  return Math.floor(Math.random() * (high - low + 1) + low);
};
