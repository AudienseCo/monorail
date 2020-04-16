'use strict';

const logger = require('../../lib/logger');

module.exports = (github) => {
  return (repo, branch, cb) => {
    github.getBranch(repo, branch, (err, data) => {
      if (err) {
        logger.error(`ERROR Getting branch for ${repo} ${branch} ${err.status}`, data)
        return cb(err);
      }
      cb(null, data.object.sha);
    })
  }
};
