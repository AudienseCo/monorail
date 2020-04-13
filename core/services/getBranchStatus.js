'use strict';

const logger = require('../../lib/logger');

const { find } = require('lodash');
const { waterfall } = require('async');

module.exports = (github, POLLING_INTERVAL_MS) => {
  return (repo, branch, cb) => {
    waterfall([
      (next) => github.getBranch(repo, branch, (err, data) => {
        if (err) {
          logger.error(`ERROR Getting branch for ${repo} ${branch}`, data)
          return next(err);
        }
        next(null, data.object.sha);
      }),
      (sha, next) => github.getProtectedBranchRequiredStatusChecks(repo, branch, (err, data) => {
        if (err && err.status === 404) {
          logger.info(`INFO Branch is not protected ${repo} ${branch}`, data)
          return next(null, sha, []);
        }
        else if (err) {
          logger.error(`ERROR Getting protected branch required status for ${repo} ${branch} ${err.status}`, data)
          return next(err);
        }
        next(null, sha, data.contexts);
      }),
      (sha, requiredChecks, next) => checkStatus(repo, sha, requiredChecks, next)
    ], cb);
  };

  function checkStatus(repo, sha, requiredChecks, cb) {
    if (!requiredChecks.length) {
      return cb(null, sha)
    }
    github.getStatusesForRef(repo, sha, (err, data) => {
      if (err) return cb(err);
      logger.info(`INFO Checking status for ${repo} ${sha}`)
      const result = combineStatusesResults(data, requiredChecks);
      if (!result.finished) {
        return setTimeout(() => checkStatus(repo, sha, requiredChecks, cb), POLLING_INTERVAL_MS);
      }
      if (!result.succeeded) return cb(new Error('CHECKS_FAILED'));
      cb(null, sha);
    });
  }

  function combineStatusesResults(statuses, requiredChecks) {
    return requiredChecks.reduce(({ finished, succeeded }, checkName) => {
      const check = find(statuses, ['context', checkName]);
      if (!check) {
        logger.info(`INFO Required check ${checkName} was not found "${statuses}"`);
        return { finished, succeeded: false };
      }

      logger.info(`INFO check ${checkName} status: ${check.state}`);

      return {
        succeeded: succeeded && check.state === 'success',
        finished: finished && ['success', 'failed'].includes(check.state)
      };
    }, { finished: true, succeeded: true });
  }
};
