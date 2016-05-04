'use strict';

require('should');
const createDeployLabelsService = require(`../../../../../\
core/services/checkers/deploy-labels/deployLabelsService`);

describe('Deploy labels service', () => {
  const deployLabelsService = createDeployLabelsService();

  context('Interface', () => {
    it('should have the "updatePullRequestCommit" method', () => {
      deployLabelsService.updatePullRequestCommit.should.be.a.Function();
    });
  });
});
