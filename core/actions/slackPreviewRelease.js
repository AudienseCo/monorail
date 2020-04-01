'use strict';

const { get } = require('lodash');
const { waterfall, mapSeries } = require('async');
const logger = require('../../lib/logger');

module.exports = function createPreviewRelease(getConfig, getBranchStatus, getReleasePreview, notify) {

  return ({ repos, verbose = false }, cb) => {
    waterfall([
      (next)            => getConfigForEachRepo(repos, next),
      (reposInfo, next) => getBranchStatusForEachRepo(reposInfo, next),
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

  function getBranchStatusForEachRepo(reposInfo, cb) {
    logger.debug('getBranchStatusForEachRepo', { reposInfo });
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      const devBranch = get(repoInfo, 'config.github.devBranch');
      getBranchStatus(repoInfo.repo, devBranch, (err, sha) => {
        if (err) {
          logger.error(`Error getting repo branch status for ${repoInfo.repo} ${devBranch}`, repoInfo.repo, devBranch, err);
          return nextRepo(null, { repo: repoInfo.repo, failReason: 'INVALID_REPO_STATUS' });
        }
        nextRepo(null, Object.assign({}, repoInfo, { sha }));
      });
    }, cb);
  }

  function notifyPreviewInSlack(reposInfo, verbose, cb) {
    logger.debug('notifyPreviewInSlack', { reposInfo, verbose });
    notify(reposInfo, 'preview', verbose, cb);
  }
};
