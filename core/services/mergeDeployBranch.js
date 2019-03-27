'use strict';

const { series } = require('async');

module.exports = (github) => {
  return (repo, masterBranch, devBranch, deployBranch, cb) => {
    series([
      next => github.merge(repo, masterBranch, deployBranch, next),
      next => github.merge(repo, devBranch, deployBranch, next),
      next => github.removeBranch(repo, deployBranch, next)
    ], err => cb(err));
  };
};
