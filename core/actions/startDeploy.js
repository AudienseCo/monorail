'use scrict';

const { mapSeries, waterfall } = require('async');
const { get } = require('lodash');

module.exports = (
  getRepoConfig,
  createDeployTemporaryBranch,
  getReleasePreview,
  deploy,
  cleanUpDeploy,
  notify
) => {
  return (repos, showPreview, cb) => {
    waterfall([
      (next)            => getConfigForEachRepo(repos, next),
      (reposInfo, next) => createTemporaryBranchesForEachRepo(reposInfo, next),
      (reposInfo, next) => getReleasePreview(reposInfo, next),
      (reposInfo, next) => notifyPreviewSlackIfEnabled(showPreview, reposInfo, next),
      (reposInfo, next) => deployEachRepo(reposInfo, next),
      (reposInfo, next) => notifyRelease(reposInfo, next),
    ], (err, reposInfo) => {
      if (err) {
        console.error('Error deploying all repos', reposInfo, err);
        mapSeries(reposInfo, cleanUpDeploy, cb);
        return;
      }
      cb();
    });

    function getConfigForEachRepo(repos, cb) {
      mapSeries(repos, (repo, nextRepo) => {
        getRepoConfig(repo, (err, config) => {
          if (err) {
            console.error('Error getting repo config', repo, err);
            return nextRepo(null, { repo, failReason: 'INVALID_REPO_CONFIG' });
          }
          nextRepo(err, { repo, config });
        });
      }, cb);
    }

    function createTemporaryBranchesForEachRepo(reposInfo, cb) {
      mapSeries(reposInfo, (repoInfo, nextRepo) => {
        if (repoInfo.failReason) return nextRepo(null, repoInfo);
        // TODO: combine with local config
        const devBranch = get(repoInfo, 'config.github.devBranch');
        createDeployTemporaryBranch(repoInfo.repo, devBranch, (err, branch) => {
          if (err) {
            console.error('Error creating temporary branch', repoInfo.repo, err);
            return nextRepo(null, Object.assign({}, repoInfo, { failReason: 'BRANCH_CREATION_FAILED' }));
          }
          nextRepo(null, Object.assign({}, repoInfo, { branch }));
        });
      }, cb);
    }

    function notifyPreviewSlackIfEnabled(showPreview, reposInfo, cb) {
      if (!showPreview) return cb(null, reposInfo);
      notify(reposInfo, 'preview', err => cb(err, reposInfo));
    }

    function deployEachRepo(reposInfo, cb) {
      mapSeries(reposInfo, (repoInfo, nextRepo) => {
        if (repoInfo.failReason) {
          cleanUpDeploy(repoInfo, err => {
            if (err) console.error('Error cleaning up deploy', repoInfo.repo, err);
            nextRepo(null, repoInfo);
          });
        }
        else deploy(repoInfo, (err, tag) => {
          // TODO: deserves a refactor
          if (err) {
            console.error('Error deploying', repoInfo.repo, err);
            return nextRepo(null, Object.assign({}, repoInfo, { failReason: 'REPO_DEPLOY_FAILED' }));
          }
          nextRepo(null, Object.assign({}, repoInfo, { tag }));
        });
      }, cb);
    }

    function notifyRelease(reposInfo, cb) {
      notify(reposInfo, 'release', err => cb(err, reposInfo));
    }

  };
};
