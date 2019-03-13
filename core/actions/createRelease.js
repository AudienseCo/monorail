'use strict';

const async = require('async');

module.exports = function(issueReleaseInfoList, releaseInfoLabel, releaseNotesFormatter,
  releaseService) {

  return function(repo, tag, ids, cb) {

    async.waterfall([

      (next) => {
        issueReleaseInfoList.get(repo, ids, next);
      },

      (releaseInfoList, next) => {
        releaseInfoLabel.addLabels(repo, releaseInfoList, ['deployed'], err => {
          if (err) { console.error('Error adding the deployed label:', err); }
          next(null, releaseInfoList);
        });
      },

      (releaseInfoList, next) => {
        const body = releaseNotesFormatter.format(releaseInfoList);
        next(null, body);
      },

      (body, next) => {
        releaseService.create(repo, tag, body, error => {
          next(error, body);
        });
      }

    ], cb);

  };
};
