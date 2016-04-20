'use strict';

const async = require('async');

module.exports = function(github, boundIssueExtractor, releaseService) {
  return function(tag, ids, cb) {
    async.reduce(ids, [], (acc, id, next) => {
      github.getPullRequest(id, (err, prInfo) => {
        if (err) return next(err);

        var boundIssue = boundIssueExtractor.extract(prInfo.body);
        if (!boundIssue) next(null, acc);

        github.getIssue(boundIssue, (err, issueInfo) => {
          next(err, acc.concat(issueInfo));
        });
      });
    }, (err, issues) => {
      if (err) cb(err);
      else releaseService.create(tag, issues, cb);
    });
  };
};
