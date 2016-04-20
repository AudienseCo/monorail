'use strict';

require('should');
const sinon = require('sinon');

const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createGetPullRequestsDeployInfo = require('../../../core/actions/getPullRequestsDeployInfo');

describe('Get pull requests deploy info action', () => {
  context('Interface', () => {
    const getPullRequestsDeployInfo = createGetPullRequestsDeployInfo();
    it('should be a function', () => {
      getPullRequestsDeployInfo.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    function createGithubDummy(response) {
      return {
        getIssueLabels: (id, cb) => {
          cb(null, response);
        }
      };
    }

    it('should get the issues deploy info', (done) => {
      const githubDummy  = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      stub.onFirstCall().callsArgWith(1, null, [{ name: 'deploy-to:tasks-as' }]);
      stub.onSecondCall().callsArgWith(1, null, [{ name: 'deploy-to:globalreports' }]);
      const prDeployInfo = createPullRequestDeployInfo(githubDummy);
      const getPullRequestsDeployInfo = createGetPullRequestsDeployInfo(prDeployInfo);
      getPullRequestsDeployInfo([1234, 4321], (err, info) => {
        info.should.be.eql({
          deployNotes: false,
          services: ['tasks-as', 'globalreports']
        });
        done();
      });
    });
  });
});
