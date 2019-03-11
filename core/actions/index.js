'use strict';

const config = require('../../config');

const checkers = [
  require('../services/checkers/qa-review'),
  require('../services/checkers/deploy-notes'),
  require('../services/checkers/deploy-labels')
];

const github = require('../../lib/github');
const slack = require('../../lib/slack');
const pullRequestDeployInfo = require('../services/pullRequestDeployInfo')(github);
const boundIssueExtractor = require('../services/boundIssueExtractor')();
const releaseService = require('../services/releaseService')(github);
const issueParticipants = require('../services/issueParticipants')(github, config);
const issueReleaseInfo = require('../services/issueReleaseInfo')(github,
  boundIssueExtractor, issueParticipants);
const releaseInfoLabel = require('../services/releaseInfoLabel')(github);
const issueReleaseInfoList = require('../services/issueReleaseInfoList')(issueReleaseInfo);
const releaseNotesFormatter = require('../services/releaseNotesFormatter')();

const pullRequestsFromChanges = require('../services/pullRequestsFromChanges')(github);
const issuesFromPullRequests = require('../services/issuesFromPullRequests')(github);
const deployInfoFromPullRequests = require('../services/deployInfoFromPullRequests')(pullRequestDeployInfo, config);

module.exports = {
  subscribeCheckersToEvents: require('./subscribeCheckersToEvents')(checkers),
  getPullRequestsDeployInfo: require('./getPullRequestsDeployInfo')(pullRequestDeployInfo, config),
  createRelease: require('./createRelease')(issueReleaseInfoList, releaseInfoLabel,
    releaseNotesFormatter, releaseService),
  previewRelease: require('./previewRelease')(github, boundIssueExtractor),
  slackPreviewRelease: require('./slackPreviewRelease')(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slack),
  getReleaseNotes: require('./getReleaseNotes')(issueReleaseInfoList, releaseNotesFormatter)
};
