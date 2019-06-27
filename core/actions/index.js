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

const branchesConfig = {
  masterBranch: config.github.masterBranch,
  devBranch: config.github.devBranch
};
const pullRequestsFromChanges = require('../services/pullRequestsFromChanges')(github, branchesConfig);
const deployInfoFromPullRequests = require('../services/deployInfoFromPullRequests')(pullRequestDeployInfo);
const getReleasePreview = require('../services/getReleasePreview')(
  pullRequestsFromChanges,
  deployInfoFromPullRequests,
  issueReleaseInfoList
);

const slackTemplates = require('../../presentation/slack')(config);
const notify = require('../services/notify')(slackTemplates, slack, config);

const clock = require('../../lib/clock')();
const getReleaseTag = require('../services/getReleaseTag')(clock);

const releaseNotesTemplate = require('../../presentation/github/releaseNotes')();
const ciDrivers = require('../../lib/ciDrivers');
const callCIDriver = require('../services/callCIDriver')(ciDrivers);
const build = require('../services/build')(callCIDriver);
const getRepoConfig = require('../services/getRepoConfig')(github, config);
const getConfig = require('../services/getConfig')(getRepoConfig, config, ciDrivers);
const createDeployTemporaryBranch = require('../services/createDeployTemporaryBranch')(github, clock);
const mergeDeployBranch = require('../services/mergeDeployBranch')(github);
const deploy = require('../services/deploy')(
  getReleaseTag,
  build,
  mergeDeployBranch,
  releaseInfoLabel,
  releaseNotesTemplate,
  releaseService
);
const cleanUpDeploy = require('../services/cleanUpDeploy')(github);


module.exports = {
  subscribeCheckersToEvents: require('./subscribeCheckersToEvents')(checkers),
  slackPreviewRelease: require('./slackPreviewRelease')(
    getConfig,
    getReleasePreview,
    notify
  ),
  startDeploy: require('./startDeploy')(
    getConfig,
    createDeployTemporaryBranch,
    getReleasePreview,
    deploy,
    cleanUpDeploy,
    notify
  )
};
