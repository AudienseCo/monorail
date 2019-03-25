'use strict';

const { reduce, waterfall, mapSeries } = require('async');
const previewReleaseTemplate = require('./slack-views/slack-preview-release');

module.exports = function createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slack, repos) {

  return (cb) => {
    waterfall([
      (next)            => getPRsFromChangesForEachRepo(repos, next),
      (reposInfo, next) => getDeployInfoForEachRepo(reposInfo, next),
      (reposInfo, next) => getIssuesToReleaseForEachRepo(reposInfo, next),
      (reposInfo, next) => notifyPreviewInSlack(reposInfo, next)
    ], cb);
  };

  function getPRsFromChangesForEachRepo(repos, cb) {
    mapSeries(repos, (repo, nextRepo) => {
      pullRequestsFromChanges({ repo }, (err, prIds) => {
        if (err) return nextRepo(null, { repo, failReason: err.message });
        nextRepo(null, { repo, prIds });
      });
    }, cb);
  }

  function getDeployInfoForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      if (repoInfo.prIds.length === 0) {
        return nextRepo(null, Object.assign({ failReason: 'NO_CHANGES' }, repoInfo));
      }
      deployInfoFromPullRequests(repoInfo.repo, repoInfo.prIds, (err, deployInfo) => {
        let failReason;
        if (err) {
          failReason = err.message;
        }
        else if (deployInfo.deployNotes) {
          failReason = 'DEPLOY_NOTES';
        }
        else if (deployInfo.services.length === 0) {
          failReason = 'NO_SERVICES';
        }
        nextRepo(null, Object.assign({ failReason, services: deployInfo.services }, repoInfo));
      });
    }, cb);
  }

  function getIssuesToReleaseForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      issuesFromPullRequests(repoInfo.repo, repoInfo.prIds, (err, issues) => {
        if (err) return nextRepo(null, Object.assign({ failReason: err.message }, repoInfo));
        nextRepo(null, Object.assign({ issues }, repoInfo));
      });
    }, cb);
  }

  function notifyPreviewInSlack(reposInfo, cb) {
    const msg = previewReleaseTemplate(reposInfo);
    slack.send(msg, cb);
  }
};
