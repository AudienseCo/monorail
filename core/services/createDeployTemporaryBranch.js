'use strict';

const { waterfall } = require('async');

//TODO: take from config
const devBranch = 'dev';

module.exports = (github, clock) => {
  return (repo, cb) => {
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
