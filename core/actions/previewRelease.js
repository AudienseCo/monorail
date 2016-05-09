'use strict';

const async = require('async');

module.exports = function createPreviewRelease(github, boundIssueExtractor) {
  return function previewRelease(pullRequestList, cb) {
    async.reduce(pullRequestList, [], (acc, id, next) => {
      github.getPullRequest(id, (err, prInfo) => {
        if (err) return next(err);

        const boundIssue = boundIssueExtractor.extract(prInfo.body);
        if (!boundIssue) next(null, acc.concat(prInfo));
        else {
          github.getIssue(boundIssue, (err, issueInfo) => {
            next(err, acc.concat(issueInfo));
          });
        }
      });
    }, cb);
  };
};
