'use strict';

require('should');

const createQAReviewChecker = require('../../../checkers/qa-review/qaReviewChecker');

describe('QA Review checker', () => {

  function createGithubDummy(result) {
    return {
      getIssueLabels: (issue, cb) => {
        cb(null, result);
      }
    };
  }
  context('Interface', () => {
    const qaReviewChecker = createQAReviewChecker();
    it('should have the "check" method', () => {
      qaReviewChecker.checkPullRequest.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    it('should return an error status if the PR has not the "review-done:qa" label added', done => {
      const githubDummy = createGithubDummy([{ name: 'other' }]);

      const qaReviewChecker = createQAReviewChecker(githubDummy);
      qaReviewChecker.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('QA Review');
        status.state.should.be.eql('failure');
        done();
      });
    });

    it('should return a success status if the PR has "review-done:qa" label added', done => {
      const githubDummy = createGithubDummy([{ name: 'review-done:qa' }]);

      const qaReviewChecker = createQAReviewChecker(githubDummy);
      qaReviewChecker.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('QA Review');
        status.state.should.be.eql('success');
        done();
      });
    });
  });
});
