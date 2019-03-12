'use strict';

const { reduce, waterfall } = require('async');
const templates = require('../../templates/slack-preview-release');

module.exports = function createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slack) {

  return function previewRelease(cb) {
    waterfall([
      pullRequestsFromChanges,
      getDeployInfo,
      getIssues
    ], (err, pullRequestList, issues, deployInfo) => {
      publishInSlack(err, pullRequestList, issues, deployInfo, cb);
    });
  };

  function getDeployInfo(pullRequestList, cb) {
    if (pullRequestList.length === 0) return cb(new Error('NO_CHANGES'));
    deployInfoFromPullRequests(pullRequestList, (err, deployInfo) => {
      if (err) return cb(err);
      if (deployInfo.deployNotes) return cb(new Error('DEPLOY_NOTES'), deployInfo);
      if (deployInfo.services.length === 0) return cb(new Error('NO_SERVICES'), deployInfo);
      cb(err, pullRequestList, deployInfo);
    });
  }

  function getIssues(pullRequestList, deployInfo, cb) {
    issuesFromPullRequests(pullRequestList, (err, issues) => {
      cb(err, pullRequestList, issues, deployInfo);
    });
  }

  function publishInSlack(err, pullRequestList, issues, deployInfo, cb) {
    const msg = err
      ? getErrorMessage(err)
      : getReleasePreviewMessage(pullRequestList, issues, deployInfo);
    slack.send(msg, cb);
  }

  function getErrorMessage(err) {
    return templates[err.message] || templates.UNkNOWN_ERROR;
  }

  function getReleasePreviewMessage(pullRequestList, issues, deployInfo) {
    return templates.RELEASE_PREVIEW({ pullRequestList, deployInfo, issues });
  };

};
