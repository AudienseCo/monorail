'use strict';

module.exports = function(prDeployInfo) {
  return function(ids, cb) {
    prDeployInfo.get(ids, cb);
  };
};
