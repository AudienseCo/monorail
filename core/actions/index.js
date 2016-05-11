'use strict';

const config = require('../../config');

const checkers = [
  require('../services/checkers/code-review'),
  require('../services/checkers/qa-review'),
  require('../services/checkers/deploy-notes'),
  require('../services/checkers/deploy-labels')
];

const github = require('../../lib/github');
const pullRequestDeployInfo = require('../services/pullRequestDeployInfo')(github);
const boundIssueExtractor = require('../services/boundIssueExtractor')();
const releaseService = require('../services/releaseService')(github);
const issueParticipants = require('../services/issueParticipants')(github);
const issueReleaseInfo = require('../services/issueReleaseInfo')(github,
  boundIssueExtractor, issueParticipants);

module.exports = {
  subscribeCheckersToEvents: require('./subscribeCheckersToEvents')(checkers),
  getPullRequestsDeployInfo: require('./getPullRequestsDeployInfo')(pullRequestDeployInfo, config),
  createRelease: require('./createRelease')(issueReleaseInfo, releaseService),
  previewRelease: require('./previewRelease')(github, boundIssueExtractor)
};
