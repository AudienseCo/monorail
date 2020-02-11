'use strict';

const { find } = require('lodash');
const { waterfall } = require('async');

module.exports = (github, POLLING_INTERVAL_MS) => {
  return (repo, branch, cb) => {
    waterfall([
      (next) => github.getBranch(repo, branch, (err, data) => {
        if (err) return next(err);
        next(null, data.object.sha);
      }),
      (sha, next) => github.getProtectedBranchRequiredStatusChecks(repo, branch, (err, data) => {
        if (err) return next(err);
        next(null, sha, data.contexts);
      }),
      (sha, requiredChecks, next) => checkStatus(repo, sha, requiredChecks, next)
    ], cb);
  };

  function checkStatus(repo, sha, requiredChecks, cb) {
    github.getChecksForRef(repo, sha, (err, data) => {
      if (err) return cb(err);
      const result = combineChecksResults(data.check_runs, requiredChecks);
      if (!result.finished) {
        return setTimeout(() => checkStatus(repo, sha, requiredChecks, cb), POLLING_INTERVAL_MS);
      }
      if (!result.succeeded) return cb(new Error('CHECKS_FAILED'));
      cb(null, sha);
    });
  }

  function combineChecksResults(checks, requiredChecks) {
    return requiredChecks.reduce(({ finished, succeeded }, checkName) => {
      const check = find(checks, ['name', checkName]);
      if (!check) return { finished, succeeded: false };
      return {
        finished: finished && check.status === 'completed',
        succeeded: succeeded && check.conclusion === 'success',
      };
    }, { finished: true, succeeded: true });
  }
};
