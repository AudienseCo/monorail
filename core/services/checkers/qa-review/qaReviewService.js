'use strict';
const async = require('async');
const logger = require('../../../../lib/logger');

module.exports = function(qaReviewChecker, github) {
  const that = {};

  that.updatePullRequestCommit = (repo, prInfo) => {
    async.waterfall([
      function check(next) {
        qaReviewChecker.checkPullRequest(repo, prInfo, next);
      },
      function getPR(status, next) {
        github.getPullRequest(repo, prInfo.number, (err, pr) => {
          next(err, status, pr);
        });
      },
      function update(status, pr, next) {
        status.sha = pr.head.sha;
        status.repo = repo;
        github.updateCommitStatus(status, (err, result) => {
          if (err) logger.error('Update commit state error', err, { status, pr });
          else logger.info('Updated commit state');
        });
      }
    ]);
  };

  return that;
};
