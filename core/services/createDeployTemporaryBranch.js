'use strict';

const { waterfall } = require('async');

module.exports = (github, clock) => {
  return (repo, devBranchSha, cb) => {
    const branchName = `deploy-${clock.now()}`;
    github.createBranch(repo, branchName, devBranchSha, (err, data) => {
      if (err) return cb(err);
      cb(null, branchName);
    });
  };
};
