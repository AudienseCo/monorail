'use strict';

const { waterfall } = require('async');

module.exports = (github, clock) => {
  return (repo, devBranch, cb) => {
    waterfall([
      (next) => {
        github.getBranch(repo, devBranch, (err, data) => {
          if (err) return next(err);
          next(null, data.object.sha);
        });
      },
      (devBranchSha, next) => {
        const branchName = `deploy-${clock.now()}`;
        github.createBranch(repo, branchName, devBranchSha, (err, data) => {
          if (err) return next(err);
          next(null, branchName);
        });
      }
    ], cb);
  };
};
