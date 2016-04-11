'use strict';

require('should');
const createQAReviewService = require('../../../checkers/qa-review/qaReviewService');

describe('QA Review service', () => {
  const qaReviewService = createQAReviewService();

  context('Interface', () => {
    it('should have the "updatePullRequestCommit" method', () => {
      qaReviewService.updatePullRequestCommit.should.be.a.Function();
    });
  });
});
