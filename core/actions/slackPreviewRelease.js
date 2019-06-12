'use strict';

const { waterfall, mapSeries } = require('async');
const logger = require('../../lib/logger');

module.exports = function createPreviewRelease(getConfig, getReleasePreview, notify, repos) {

  return ({ verbose = false }, cb) => {
    waterfall([
      (next)            => getConfigForEachRepo(repos, next),
      (reposInfo, next) => getReleasePreview(reposInfo, next),
      (reposInfo, next) => notifyPreviewInSlack(reposInfo, verbose, next)
    ], cb);
  };

  function getConfigForEachRepo(repos, cb) {
    logger.debug('getConfigForEachRepo', { repos });
    mapSeries(repos, (repo, nextRepo) => {
      getConfig(repo, (err, config) => {
        if (err) {
          logger.error('Error getting repo config', repo, err);
          return nextRepo(null, { repo, failReason: 'INVALID_REPO_CONFIG' });
        }
        nextRepo(null, { repo, config });
      });
    }, cb);
  }

  function notifyPreviewInSlack(reposInfo, verbose, cb) {
    logger.debug('notifyPreviewInSlack', { reposInfo, verbose });
    notify(reposInfo, 'preview', verbose, cb);
  }
};
