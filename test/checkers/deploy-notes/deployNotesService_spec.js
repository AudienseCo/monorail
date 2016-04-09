'use strict';

require('should');
const createDeployNotesService = require('../../../checkers/deploy-notes/deployNotesService');

describe('Deploy notes service', () => {
  const deployNotesService = createDeployNotesService();

  context('Interface', () => {
    it('should have the "updatePullRequestCommit" method', () => {
      deployNotesService.updatePullRequestCommit.should.be.a.Function();
    });
  });
});
