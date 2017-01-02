'use strict';

const async = require('async');

module.exports = function getReleaseNotesBuilder(issueReleaseInfoList, releaseNotesFormatter) {
  return (ids, filterLabels, callback) => {
    async.waterfall([
      (next) => {
        issueReleaseInfoList.get(ids, next);
      },

      (releaseInfoList, next) => {
        if (!filterLabels || filterLabels.length === 0) return next(null, releaseInfoList);

        const filteredReleaseInfoList = releaseInfoList.filter(info => {
          if (!info.issue || !info.issue.labels) return false;

          const labels = info.issue.labels.map(labelInfo => labelInfo.name);
          return labels.indexOf(filterLabels[0]) > -1;
        });

        next(null, filteredReleaseInfoList);
      },

      (releaseInfoList, next) => {
        const body = releaseNotesFormatter.format(releaseInfoList);
        next(null, body);
      }
    ], callback);
  };
};
