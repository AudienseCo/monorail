'use strict';

module.exports = function createGetPullRequestsDeployInfo(prDeployInfo) {
  return function(ids, cb) {
    prDeployInfo.get(ids, cb);
  };
};
