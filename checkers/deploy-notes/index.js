'use strict';

const github = require('../../lib/github');
const createDeployNotesSubscriber = require('./deployNotesSubscriber');
const createDeployNotesService    = require('./deployNotesService');
const createDeployNotesChecker    = require('./deployNotesChecker');

module.exports = {
  subscribe: (emitter) => {
    const deployNotesChecker  = createDeployNotesChecker(github);
    const deployNotesService  = createDeployNotesService(deployNotesChecker, github);
    const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
    deployNotesSubscriber.subscribe();
  }
};
