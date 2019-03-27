'use strict';

const { waterfall, mapSeries } = require('async');
const previewReleaseTemplate = require('./slack-views/preview-release');

module.exports = function createPreviewRelease(getReleasePreview, slack, repos) {

  return (cb) => {
    const reposBranches = repos.map(repo => ({ repo }));
    waterfall([
      (next)            => getReleasePreview(reposBranches, next),
      (reposInfo, next) => notifyPreviewInSlack(reposInfo, next)
    ], cb);
  };

  function notifyPreviewInSlack(reposInfo, cb) {
    const msg = previewReleaseTemplate(reposInfo);
    slack.send(msg, cb);
  }
};
