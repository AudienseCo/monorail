'use strict';

const { reduce, waterfall } = require('async');

module.exports = function createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests) {

  return function previewRelease(cb) {
    waterfall([
      next => pullRequestsFromChanges(next),
      (pullRequestList, next) => {
        issuesFromPullRequests(pullRequestList, (err, issues) => {
          next(err, pullRequestList, issues);
        });
      },
      (pullRequestList, issues, next) => {
        deployInfoFromPullRequests(pullRequestList, (err, deployInfo) => {
          next(err, pullRequestList, issues, deployInfo);
        });
      }
    ], cb);
  };

};
