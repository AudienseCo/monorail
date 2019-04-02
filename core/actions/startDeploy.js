'use scrict';

const { mapSeries, waterfall } = require('async');
const { get } = require('lodash');
const previewReleaseTemplate = require('./slack-views/preview-release');
const releaseTemplate = require('./slack-views/release');

// TODO: Don't break with error at repo level, use failReason

module.exports = (
  getRepoConfig,
  createDeployTemporaryBranch,
  getReleasePreview,
  deploy,
  cleanUpDeploy,
  slack
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
          nextRepo(err, { repo, config });
        });
      }, cb);
    }

    function createTemporaryBranchesForEachRepo(reposInfo, cb) {
      mapSeries(reposInfo, (repoInfo, nextRepo) => {
        const devBranch = get(repoInfo, 'config.github.devBranch');
        createDeployTemporaryBranch(repoInfo.repo, devBranch, (err, branch) => {
          nextRepo(err, Object.assign({ branch }, repoInfo));
        });
      }, cb);
    }

    function notifyPreviewSlackIfEnabled(showPreview, reposInfo, cb) {
      if (!showPreview) return cb(null, reposInfo);
      const msg = previewReleaseTemplate(reposInfo);
      slack.send(msg, err => cb(err, reposInfo));
    }

    function deployEachRepo(reposInfo, cb) {
      mapSeries(reposInfo, (repoInfo, nextRepo) => {
        if (repoInfo.failReason) {
          cleanUpDeploy(repoInfo, err => {
            if (err) console.error(err);
            nextRepo(null, repoInfo)
          });
        }
        else deploy(repoInfo, nextRepo);
      }, cb);
    }

    function notifyRelease(reposInfo, cb) {
      // TODO: notify to general channel filtered by notify-staff
      // TODO: improve the release template to show the release ver and participants
      const msg = releaseTemplate(reposInfo);
      slack.send(msg, err => cb(err, reposInfo));
    }

  };
};
