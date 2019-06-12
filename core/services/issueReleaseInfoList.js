'use strict';

const async = require('async');
const logger = require('../../lib/logger');

module.exports = function issueReleaseInfoListBuilder(issueReleaseInfo) {
  const that = {};

  that.get = (repo, ids, callback) => {
    async.map(ids, (id, nextId) => {
      logger.debug('issueReleaseInfo.getInfo', { repo, id });
      issueReleaseInfo.getInfo(repo, id, (err, issueReleaseInfo) => {
        nextId(err, issueReleaseInfo);
      });
    }, callback);
  };

  return that;
};
