'use strict';

const github = require('../../../../lib/github');
const createDeployLabelsSubscriber = require('./deployLabelsSubscriber');
const createDeployLabelsService    = require('./deployLabelsService');
const createDeployLabelsChecker    = require('./deployLabelsChecker');

module.exports = {
  subscribe: (emitter) => {
    const deployLabelsChecker  = createDeployLabelsChecker(github);
    const deployLabelsService  = createDeployLabelsService(deployLabelsChecker, github);
    const deployLabelsSubscriber = createDeployLabelsSubscriber(emitter, deployLabelsService);
    deployLabelsSubscriber.subscribe();
  }
};
