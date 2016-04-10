'use strict';

require('should');

const createDeployNotesChecker = require('../../../checkers/deploy-notes/deployNotesChecker');

describe('Deploy notes checker', () => {
  function createBoundIssueExtractorDummy(result) {
    return {
      extract: (body) => {
        return result;
      }
    };
  }

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

    const headInfo = {
      head: { sha: '123abc' }
    };

    it('should return an error status if the bound issue has the deploy tag added', done => {
      const boundIssueExtractorDummy = createBoundIssueExtractorDummy('1234');
      const githubDummy = createGithubDummy([{ name: 'Deploy Notes' }]);

      const deployNotes = createDeployNotesChecker(boundIssueExtractorDummy, githubDummy);
      const prInfo = Object.assign({}, headInfo, { body: '#1234' });
      deployNotes.checkPullRequest(prInfo, (err, status) => {
        status.context.should.be.eql('Deploy Notes');
        status.state.should.be.eql('failure');
        done();
      });
    });

    it('should return a success status if none issue has the deploy tag added', done => {
      const boundIssueExtractorDummy = createBoundIssueExtractorDummy('1234');
      const githubDummy = createGithubDummy([]);

      const deployNotes = createDeployNotesChecker(boundIssueExtractorDummy, githubDummy);
      const prInfo = Object.assign({}, headInfo, { body: '#1234' });
      deployNotes.checkPullRequest(prInfo, (err, status) => {
        status.context.should.be.eql('Deploy Notes');
        status.state.should.be.eql('success');
        done();
      });
    });

    it('should return a success status if the PR has not any issue bound', done => {
      const boundIssueExtractorDummy = createBoundIssueExtractorDummy();
      const githubDummy = createGithubDummy([]);

      const deployNotes = createDeployNotesChecker(boundIssueExtractorDummy, githubDummy);
      const prInfo = Object.assign({}, headInfo, { body: '#1234' });
      deployNotes.checkPullRequest(prInfo, (err, status) => {
        status.context.should.be.eql('Deploy Notes');
        status.state.should.be.eql('success');
        done();
      });
    });
  });
});
