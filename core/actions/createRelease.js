'use strict';

const async = require('async');

module.exports = function(issueReleaseInfoList, releaseInfoLabel, releaseNotesFormatter,
  releaseService) {

  return function(tag, ids, cb) {

    async.waterfall([

      (next) => {
        issueReleaseInfoList.get(ids, next);
      },

      (releaseInfoList, next) => {
        releaseInfoLabel.addLabels(releaseInfoList, ['deployed'], err => {
          if (err) { console.error('Error adding the deployed label:', err); }
          next(null, releaseInfoList);
        });
      },

      (releaseInfoList, next) => {
        var body = releaseNotesFormatter.format(releaseInfoList);
        next(null, body);
      },

      (body, next) => {
        releaseService.create(tag, body, next);
      }

    ], cb);

  };
};
