'use strict';

const { reduce, waterfall } = require('async');
const templates = require('../../templates/slack-preview-release');
const organization = 'AudienseCo';
const repo = 'socialbro';

module.exports = function createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slack) {

  return function previewRelease(cb) {
    waterfall([
      next => pullRequestsFromChanges(next),
      (pullRequestList, next) => {
        if (pullRequestList.length === 0) return next(new Error('NO_CHANGES'));
        deployInfoFromPullRequests(pullRequestList, (err, deployInfo) => {
          if (deployInfo.deployNotes) return next(new Error('DEPLOY_NOTES'), deployInfo);
          if (deployInfo.services.length === 0) return next(new Error('NO_SERVICES'), deployInfo);
          next(err, pullRequestList, deployInfo);
        });
      },
      (pullRequestList, deployInfo, next) => {
        issuesFromPullRequests(pullRequestList, (err, issues) => {
          next(err, pullRequestList, issues, deployInfo);
        });
      }
    ], (err, pullRequestList, issues, deployInfo) => {
      const msg = err
        ? getErrorMessage(err)
        : getReleasePreviewMessage(pullRequestList, issues, deployInfo);
      slack.send(msg, cb);
    });
  };

  function getErrorMessage(err) {
    return templates[err.message] || templates.UNkNOWN_ERROR;
  }

  function getReleasePreviewMessage(pullRequestList, issues, deployInfo) {
    return templates.RELEASE_PREVIEW({ pullRequestList, deployInfo, issues, organization, repo });
  };

};
