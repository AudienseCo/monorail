'use strict';
var async = require('async');

module.exports = function createDeployNotesService(deployNotesChecker, github) {
  let that = {};

  that.updatePullRequestCommit = (prInfo) => {
    async.waterfall([
      function check(next) {
        deployNotesChecker.checkPullRequest(prInfo, next);
      },
      function getPR(status, next) {
        github.getPullRequest(prInfo.number, (err, pr) => {
          next(err, status, pr);
        });
      },
      function update(status, pr, next) {
        status.sha = pr.head.sha;
        github.updateCommitStatus(status, (err, result) => {
          if (err) console.log('Update commit state error', err);
          else console.log('Updated commit state');
        });
      }
    ]);
  };

  return that;
};