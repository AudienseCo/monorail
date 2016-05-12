'use strict';

const async = require('async');

module.exports = function(issueReleaseInfo, releaseInfoLabel, releaseService) {
  return function(tag, ids, cb) {

    async.waterfall([
      function getIssues(next) {
        async.map(ids, (id, nextId) => {
          issueReleaseInfo.getInfo(id, (err, issueReleaseInfo) => {
            nextId(err, issueReleaseInfo);
          });
        }, next);
      },

      function setIssuesAsDeployed(releaseInfo, next) {
        releaseInfoLabel.addLabels(releaseInfo, ['deployed'], err => {
          if (err) { console.log('Error adding the deployed label:', err); }
          next(null, releaseInfo);
        });
      },

      function createRelease(releaseInfo, next) {
        releaseService.create(tag, releaseInfo, next);
      }

    ], cb);

  };
};
