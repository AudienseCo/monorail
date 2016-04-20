'use strict';

require('should');

const createQAReviewChecker = require('../../../../../core/services/checkers/code-review/codeReviewChecker');

describe('QA Review checker', () => {

  function createGithubDummy(result) {
    return {
      getIssueLabels: (issue, cb) => {
        cb(null, result);
      }
    };
  }
  context('Interface', () => {
    const codeReviewChecker = createQAReviewChecker();
    it('should have the "check" method', () => {
      codeReviewChecker.checkPullRequest.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    it('should return an error status if the PR has not the "review-done:code" label added', done => {
      const githubDummy = createGithubDummy([{ name: 'other' }]);

      const codeReviewChecker = createQAReviewChecker(githubDummy);
      codeReviewChecker.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Code Review');
        status.state.should.be.eql('failure');
        done();
      });
    });

    it('should return a success status if the PR has "review-done:code" label added', done => {
      const githubDummy = createGithubDummy([{ name: 'review-done:code' }]);

      const codeReviewChecker = createQAReviewChecker(githubDummy);
      codeReviewChecker.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Code Review');
        status.state.should.be.eql('success');
        done();
      });
    });
  });
});
