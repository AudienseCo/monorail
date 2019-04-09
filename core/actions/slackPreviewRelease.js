'use strict';

const { waterfall, mapSeries } = require('async');

module.exports = function createPreviewRelease(getRepoConfig, getReleasePreview, notify, repos) {

  return (cb) => {
    waterfall([
      (next)            => getConfigForEachRepo(repos, next),
      (reposInfo, next) => getReleasePreview(reposInfo, next),
      (reposInfo, next) => notifyPreviewInSlack(reposInfo, next)
    ], cb);
  };

  function getConfigForEachRepo(repos, cb) {
    mapSeries(repos, (repo, nextRepo) => {
      getRepoConfig(repo, (err, config) => {
        if (err) {
          console.error('Error getting repo config', repo, err);
          return nextRepo(null, { repo, failReason: 'INVALID_REPO_CONFIG' });
        }
        nextRepo(null, { repo, config });
      });
    }, cb);
  }

  function notifyPreviewInSlack(reposInfo, cb) {
    notify(reposInfo, 'preview', cb);
  }
};
