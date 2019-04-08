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
        console.error('Error deploying', reposInfo, err);
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
            return nextRepo(null, { repo, failReason: err.message });
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
            return nextRepo(null, Object.assign({ failReason: err.message }, repoInfo));
          }
          nextRepo(null, Object.assign({ branch }, repoInfo));
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
        else deploy(repoInfo, (err, repoInfo) => {
          if (err) {
            console.error('Error deploying', repoInfo.repo, err);
            return nextRepo(null, Object.assign({ failReason: err.message }, repoInfo));
          }
          nextRepo(null, repoInfo);
        });
      }, cb);
    }

    function notifyRelease(reposInfo, cb) {
      notify(reposInfo, 'release', err => cb(err, reposInfo));
    }

  };
};
