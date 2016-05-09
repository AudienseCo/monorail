'use strict';

require('should');

const createDeployLablesChecker = require('../../../../../core/services/checkers/deploy-labels/deployLabelsChecker');

describe('Deploy notes checker', () => {

  function createGithubDummy(result) {
    return {
      getIssueLabels: (issue, cb) => {
        cb(null, result);
      }
    };
  }
  context('Interface', () => {
    const deployLabels = createDeployLablesChecker();
    it('should have the "check" method', () => {
      deployLabels.checkPullRequest.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    it('should return an error status if there are not any deploy label', done => {
      const githubDummy = createGithubDummy([{ name: 'other label' }]);

      const deployLabels = createDeployLablesChecker(githubDummy);
      deployLabels.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Deploy Labels');
        status.state.should.be.eql('failure');
        done();
      });
    });

    it('should return a success status if there is any deploy label', done => {
      const githubDummy = createGithubDummy([{ name: 'deploy-to:tasks' }]);

      const deployLabels = createDeployLablesChecker(githubDummy);
      deployLabels.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Deploy Labels');
        status.state.should.be.eql('success');
        done();
      });
    });
  });
});