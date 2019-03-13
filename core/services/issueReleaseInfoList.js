'use strict';

const async = require('async');

module.exports = function issueReleaseInfoListBuilder(issueReleaseInfo) {
  const that = {};

  that.get = (repo, ids, callback) => {
    async.map(ids, (id, nextId) => {
      issueReleaseInfo.getInfo(repo, id, (err, issueReleaseInfo) => {
        nextId(err, issueReleaseInfo);
      });
    }, callback);
  };

  return that;
};
