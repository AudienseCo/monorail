'use strict';

const github = require('../../lib/github');
const createDeployNotesSubscriber = require('./deployNotesSubscriber');
const createDeployNotesService    = require('./deployNotesService');
const createDeployNotesChecker    = require('./deployNotesChecker');
const createBoundIssueExtractor   = require('./boundIssueExtractor');

module.exports = {
  subscribe: (emitter) => {
    const boundIssueExtractor = createBoundIssueExtractor();
    const deployNotesChecker  = createDeployNotesChecker(boundIssueExtractor, github);
    const deployNotesService  = createDeployNotesService(deployNotesChecker, github);
    const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
    deployNotesSubscriber.subscribe();
  }
};
