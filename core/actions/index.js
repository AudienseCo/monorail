'use strict';

const checkers = [
  require('../services/checkers/code-review'),
  require('../services/checkers/qa-review'),
  require('../services/checkers/deploy-notes')
];

const github = require('../../lib/github');
const pullRequestDeployInfo = require('../services/pullRequestDeployInfo')(github);
const boundIssueExtractor = require('../services/boundIssueExtractor')();
const releaseService = require('../services/releaseService')(github);

module.exports = {
  subscribeCheckersToEvents: require('./subscribeCheckersToEvents')(checkers),
  getPullRequestsDeployInfo: require('./getPullRequestsDeployInfo')(pullRequestDeployInfo),
  createRelease: require('./createRelease')(github, boundIssueExtractor, releaseService)
};
