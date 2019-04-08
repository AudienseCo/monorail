'use strict';

const { waterfall, mapSeries } = require('async');

module.exports = function createPreviewRelease(getRepoConfig, getReleasePreview, template, slack, repos) {

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
        nextRepo(err, { repo, config });
      });
    }, cb);
  }

  function notifyPreviewInSlack(reposInfo, cb) {
    const msg = template(reposInfo);
    slack.send(msg, cb);
  }
};
