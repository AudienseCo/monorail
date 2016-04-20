'use strict';

const checkers = [
  require('../services/checkers/code-review'),
  require('../services/checkers/qa-review'),
  require('../services/checkers/deploy-notes')
];

const pullRequestDeployInfo = require('../services/pullRequestDeployInfo');

module.exports = {
  subscribeCheckersToEvents: require('./subscribeCheckersToEvents')(checkers),
  getPullRequestsDeployInfo: require('./getPullRequestsDeployInfo')(pullRequestDeployInfo)
};
