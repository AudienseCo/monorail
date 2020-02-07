'use strict';
const logger = require('../../lib/logger');

module.exports = (github) => {
  return (repo, branch, cb) => {
    const sha = `heads/${branch}`;
    github.getCommitStatus(repo, sha, (err, data) => {
      if (err) return cb(err);
      const success = data.state === 'success';
      logger.debug('getBranchStatus', repo, branch, sha, data.state);
      cb(null, data.sha, success);
    });
  };
};
