'use strict';

const async = require('async');

module.exports = function issueReleaseInfoListBuilder(issueReleaseInfo) {
  const that = {};

  that.get = (ids, callback) => {
    async.map(ids, (id, nextId) => {
      issueReleaseInfo.getInfo(id, (err, issueReleaseInfo) => {
        nextId(err, issueReleaseInfo);
      });
    }, callback);
  };

  return that;
};
