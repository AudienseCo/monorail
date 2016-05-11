'use strict';

const async = require('async');

module.exports = function(issueReleaseInfo, releaseService) {
  return function(tag, ids, cb) {

    async.map(ids, (id, next) => {
      issueReleaseInfo.getInfo(id, (err, issueReleaseInfo) => {
        next(err, issueReleaseInfo);
      });
    }, (err, releaseInfo) => {
      if (err) cb(err);
      else releaseService.create(tag, releaseInfo, cb);
    });

  };
};
