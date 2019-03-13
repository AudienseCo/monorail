'use strict';

const { reduce } = require('async');
const boundIssueExtractor = require('./boundIssueExtractor')();

module.exports = (github) => {
  return (repo, pullRequestList, cb) => {
    reduce(pullRequestList, [], (acc, id, next) => {
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
