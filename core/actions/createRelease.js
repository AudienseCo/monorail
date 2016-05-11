'use strict';

const async = require('async');

module.exports = function(github, boundIssueExtractor, releaseService, issueParticipants) {
  return function(tag, ids, cb) {
    async.reduce(ids, [], (acc, id, next) => {
      async.waterfall([
        function getPRInfo(next) {
          github.getPullRequest(id, next);
        },

        function getBoundIssue(prInfo, next) {
          const boundIssue = boundIssueExtractor.extract(prInfo.body);
          if (!boundIssue) return next(null, [prInfo]);

          github.getIssue(boundIssue, (err, issueInfo) => {
            next(err, [prInfo, issueInfo]);
          });
        },

        function getParticipants(issueList, next) {
          issueParticipants.getParticipants(issueList, (err, participants) => {
            next(err, issueList, participants);
          });
        },

        function pickIssue(issueList, participants, next) {
          next(null, issueList[1] || issueList[0], participants);
        }
      ], (err, issue, participants) => {
        next(err, acc.concat({ issue: issue, participants: participants }));
      });
    }, (err, releaseInfo) => {
      if (err) cb(err);
      else releaseService.create(tag, releaseInfo, (releaseError) => {
        cb(releaseError, releaseInfo);
      });
    });
  };
};
