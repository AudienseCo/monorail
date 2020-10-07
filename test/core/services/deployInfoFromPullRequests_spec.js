'use strict';

require('should');
const sinon = require('sinon');

const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createDeployInfoFromPullRequests = require('../../../core/services/deployInfoFromPullRequests');
const repoConfig = require('../../fixtures/repoConfig.json');

describe('Get pull requests deploy info service', () => {
  context('Interface', () => {
    const deployInfoFromPullRequests = createDeployInfoFromPullRequests();
    it('should be a function', () => {
      deployInfoFromPullRequests.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    function createGithubDummy(response) {
      return {
        getIssueLabels: (repo, id, cb) => {
          cb(null, response);
        }
      };
    }

    it('should get the issues deploy info', (done) => {
      const githubDummy  = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      const repo = 'socialbro';

      stub.onFirstCall().callsArgWith(2, null, [{ name: 'deploy-to:task-as' }]);
      stub.onSecondCall().callsArgWith(2, null, [
        { name: 'deploy-to:globalreports' },
        { name: 'deploy-to:dashboard' },
        { name: 'deploy-to:rollbackeable-service' }
      ]);
      const prDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(prDeployInfo);
      deployInfoFromPullRequests(repo, [1234, 4321], repoConfig.deploy, (err, info) => {
        info.should.be.eql({
          deployNotes: false,
          jobs: [
            {
              name: 'nodejs v8.6.0',
              deployTo: [
                'task-as',
                'globalreports-as',
                { "name": "rollbackeable service", "rollback": true }
              ],
              params: {}
            },
            {
              name: 'nodejs v10.0.0',
              deployTo: [
                'dashboard-as',
                'task-as'
              ],
              params: {
                grunt: true,
                statics: true
              }
            }
          ]
        });
        done();
      });
    });

  });
});
