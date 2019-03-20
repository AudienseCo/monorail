'use strict';

var async = require('async');

module.exports = function(github, boundIssueExtractor, issueParticipants) {
  const that = {};

  that.getInfo = function(repo, prId, cb) {
    async.waterfall([

      function getPRInfo(next) {
        github.getIssue(repo, prId, next);
      },

      function getBoundIssue(prInfo, next) {
        const boundIssue = boundIssueExtractor.extract(prInfo.body);
        if (!boundIssue) return next(null, [prInfo]);

        github.getIssue(repo, boundIssue, (err, issueInfo) => {
          next(err, [prInfo, issueInfo]);
        });
      },

      function getParticipants(issueList, next) {
        issueParticipants.getParticipants(repo, issueList, (err, participants) => {
          next(err, issueList, participants);
        });
      },

      function pickIssue(issueList, participants, next) {
        next(null, issueList[1] || issueList[0], participants);
      },

      function format(issue, participants, next) {
        next(null, { issue: issue, participants: participants });
      }
    ], cb);
  };

  return that;
};
