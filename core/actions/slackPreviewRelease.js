'use strict';

const { reduce, waterfall, mapSeries } = require('async');
const previewReleaseTemplate = require('./slack-views/slack-preview-release');

module.exports = function createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slack, repos) {

  return function previewRelease(cb) {
    mapSeries(repos, repoReleasePreview, (err, releasePreview) => {
      if (err) return cb(err);
      publishInSlack(releasePreview, cb)
    });
  };

  function repoReleasePreview(repo, cb) {
    waterfall([
      next => getPullRequests(repo, next),
      getDeployInfo,
      getIssues
    ], (error, pullRequestList, issues, deployInfo) => {
      cb(null, { repo, error, pullRequestList, issues, deployInfo });
    });
  }

  function getPullRequests(repo, cb) {
    pullRequestsFromChanges(repo, (err, pullRequestList) => {
      cb(err, repo, pullRequestList);
    });
  }

  function getDeployInfo(repo, pullRequestList, cb) {
    if (pullRequestList.length === 0) return cb(new Error('NO_CHANGES'));
    deployInfoFromPullRequests(repo, pullRequestList, (err, deployInfo) => {
      if (err) return cb(err);
      if (deployInfo.deployNotes) return cb(new Error('DEPLOY_NOTES'), deployInfo);
      if (deployInfo.services.length === 0) return cb(new Error('NO_SERVICES'), deployInfo);
      cb(err, repo, pullRequestList, deployInfo);
    });
  }

  function getIssues(repo, pullRequestList, deployInfo, cb) {
    issuesFromPullRequests(repo, pullRequestList, (err, issues) => {
      cb(err, pullRequestList, issues, deployInfo);
    });
  }

  function publishInSlack(releasePreview, cb) {
    const msg = previewReleaseTemplate(releasePreview);
    slack.send(msg, cb);
  }
};
