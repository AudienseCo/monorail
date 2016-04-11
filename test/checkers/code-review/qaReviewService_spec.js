'use strict';

require('should');
const createQAReviewService = require('../../../checkers/code-review/codeReviewService');

describe('Code Review service', () => {
  const codeReviewService = createQAReviewService();

  context('Interface', () => {
    it('should have the "updatePullRequestCommit" method', () => {
      codeReviewService.updatePullRequestCommit.should.be.a.Function();
    });
  });
});
