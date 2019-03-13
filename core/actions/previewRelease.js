'use strict';

const async = require('async');

module.exports = function createPreviewRelease(github, boundIssueExtractor) {
  return function previewRelease(repo, pullRequestList, cb) {
    async.reduce(pullRequestList, [], (acc, id, next) => {
      github.getPullRequest(repo, id, (err, prInfo) => {
        if (err) return next(err);

        const boundIssue = boundIssueExtractor.extract(prInfo.body);
        if (!boundIssue) next(null, acc.concat(prInfo));
        else {
          github.getIssue(repo, boundIssue, (err, issueInfo) => {
            next(err, acc.concat(issueInfo));
          });
        }
      });
    }, cb);
  };
};
