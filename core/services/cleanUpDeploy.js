'use strict';

const { series } = require('async');

module.exports = (github) => {
  return (repoInfo, cb) => {
    series([
      next => github.removeBranch(repoInfo.repo, repoInfo.branch, next),
      next => {
        if (!repoInfo.tag) return next(null, next);
        github.removeTag(repoInfo.repo, repoInfo.tag, next);
      }
    ], err => cb(err, repoInfo));
  };
};
