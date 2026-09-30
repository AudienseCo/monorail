'use strict';

const { series } = require('async');

module.exports = (github) => {
  return (repo, masterBranch, devBranch, deployBranch, cb) => {
    series([
      next => github.merge(repo, masterBranch, deployBranch, withContext(`merging ${deployBranch} into ${masterBranch}`, next)),
      next => github.merge(repo, devBranch, deployBranch, withContext(`merging ${deployBranch} into ${devBranch}`, next)),
      next => github.removeBranch(repo, deployBranch, withContext(`removing branch ${deployBranch}`, next))
    ], err => cb(err));
  };
};

function withContext(context, cb) {
  return (err, ...results) => {
    if (!err) return cb(null, ...results);
    const status = err.status ? ` (HTTP ${err.status})` : '';
    const error = new Error(`Error ${context}: ${err.message}${status}`);
    error.status = err.status;
    error.cause = err;
    cb(error);
  };
}
