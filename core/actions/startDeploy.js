'use scrict';

const { mapSeries, waterfall } = require('async');
const { get } = require('lodash');
const logger = require('../../lib/logger');

module.exports = (
  deploysController,
  getConfig,
  getBranchStatus,
  createDeployTemporaryBranch,
  getReleasePreview,
  deploy,
  cleanUpDeploy,
  notify
) => {
  return ({ repos, showPreview, verbose = false }, cb) => {
    try {
      deploysController.start();
    } catch (deployError) {
      logger.error('Already deploying error', repos, deployError);
      notify(repos, 'deployInProgress', verbose, slackError => {
        if (slackError) logger.error(`Error notifying slack: ${err.message}`, repos, slackError);
      });
      return cb(deployError);
    }

    waterfall([
      (next)            => getConfigForEachRepo(repos, next),
      (reposInfo, next) => getBranchStatusForEachRepo(reposInfo, next),
      (reposInfo, next) => createTemporaryBranchesForEachRepo(reposInfo, next),
      (reposInfo, next) => getReleasePreview(reposInfo, next),
      (reposInfo, next) => notifyPreviewSlackIfEnabled(showPreview, reposInfo, verbose, next),
      (reposInfo, next) => deployEachRepo(reposInfo, next),
      (reposInfo, next) => notifyRelease(reposInfo, next),
    ], (err, reposInfo) => {
      deploysController.finish();
      if (err) {
        logger.error('Error deploying all repos', reposInfo, err);
        mapSeries(reposInfo, cleanUpDeploy, cb);
        return;
      }
      cb();
    });

    function getConfigForEachRepo(repos, cb) {
      logger.debug('getConfigForEachRepo', { repos });
      mapSeries(repos, (repo, nextRepo) => {
        getConfig(repo, (err, config) => {
          if (err) {
            logger.error('Error getting repo config', repo, err);
            return nextRepo(null, { repo, failReason: 'INVALID_REPO_CONFIG' });
          }
          nextRepo(err, { repo, config });
        });
      }, cb);
    }

    function getBranchStatusForEachRepo(reposInfo, cb) {
      logger.debug('getBranchStatusForEachRepo', { reposInfo });
      mapSeries(reposInfo, (repoInfo, nextRepo) => {
        const devBranch = get(repoInfo, 'config.github.devBranch');
        getBranchStatus(repoInfo.repo, devBranch, (err, sha) => {
          if (err) {
            logger.error('Error getting repo branch status', repoInfo.repo, devBranch, err);
            return nextRepo(null, { repo: repoInfo.repo, failReason: 'INVALID_REPO_STATUS' });
          }
          nextRepo(null, Object.assign({}, repoInfo, { sha }));
        });
      }, cb);
    }

    function createTemporaryBranchesForEachRepo(reposInfo, cb) {
      logger.debug('createTemporaryBranchesForEachRepo', reposInfo);
      mapSeries(reposInfo, (repoInfo, nextRepo) => {
        if (repoInfo.failReason) return nextRepo(null, repoInfo);
        createDeployTemporaryBranch(repoInfo.repo, repoInfo.sha, (err, branch) => {
          if (err) {
            logger.error('Error creating temporary branch', repoInfo.repo, err);
            return nextRepo(null, Object.assign({}, repoInfo, { failReason: 'BRANCH_CREATION_FAILED' }));
          }
          nextRepo(null, Object.assign({}, repoInfo, { branch }));
        });
      }, cb);
    }

    function notifyPreviewSlackIfEnabled(showPreview, reposInfo, verbose, cb) {
      logger.debug('notifyPreviewSlackIfEnabled', { showPreview, reposInfo, verbose });
      if (!showPreview) return cb(null, reposInfo);
      notify(reposInfo, 'preview', verbose, err => cb(err, reposInfo));
    }

    function deployEachRepo(reposInfo, cb) {
      logger.debug('deployEachRepo', reposInfo);
      mapSeries(reposInfo, (repoInfo, nextRepo) => {
        if (repoInfo.failReason) {
          cleanUpDeploy(repoInfo, err => {
            if (err) logger.error('Error cleaning up deploy', repoInfo.repo, err);
            nextRepo(null, repoInfo);
          });
        }
        else deploy(repoInfo, (err, tag) => {
          // TODO: deserves a refactor
          if (err) {
            logger.error('Error deploying', repoInfo.repo, err);
            return nextRepo(null, Object.assign({}, repoInfo, { failReason: 'REPO_DEPLOY_FAILED' }));
          }
          nextRepo(null, Object.assign({}, repoInfo, { tag }));
        });
      }, cb);
    }

    function notifyRelease(reposInfo, cb) {
      logger.debug('notifyRelease', reposInfo);
      notify(reposInfo, 'release', verbose, err => cb(err, reposInfo));
    }

  };
};
