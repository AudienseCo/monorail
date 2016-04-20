'use strict';

require('should');

const createDeployNotesChecker = require('../../../../../core/services/checkers/deploy-notes/deployNotesChecker');

describe('Deploy notes checker', () => {

  function createGithubDummy(result) {
    return {
      getIssueLabels: (issue, cb) => {
        cb(null, result);
      }
    };
  }
  context('Interface', () => {
    const deployNotes = createDeployNotesChecker();
    it('should have the "check" method', () => {
      deployNotes.checkPullRequest.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    it('should return an error status if the PR has the deploy notes tag added', done => {
      const githubDummy = createGithubDummy([{ name: 'Deploy Notes' }]);

      const deployNotes = createDeployNotesChecker(githubDummy);
      deployNotes.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Deploy Notes');
        status.state.should.be.eql('failure');
        done();
      });
    });

    it('should return a success status if the PR has not the deploy notes tag added', done => {
      const githubDummy = createGithubDummy([]);

      const deployNotes = createDeployNotesChecker(githubDummy);
      deployNotes.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Deploy Notes');
        status.state.should.be.eql('success');
        done();
      });
    });
  });
});
