'use strict';

require('should');
const sinon = require('sinon');

const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createDeployInfoFromPullRequests = require('../../../core/services/deployInfoFromPullRequests');

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
        getIssueLabels: (id, cb) => {
          cb(null, response);
        }
      };
    }

    it('should get the issues deploy info', (done) => {
      const githubDummy  = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      const configDummy = {};

      stub.onFirstCall().callsArgWith(1, null, [{ name: 'deploy-to:tasks-as' }]);
      stub.onSecondCall().callsArgWith(1, null, [{ name: 'deploy-to:globalreports' }]);
      const prDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(prDeployInfo, configDummy);
      deployInfoFromPullRequests([1234, 4321], (err, info) => {
        info.should.be.eql({
          deployNotes: false,
          services: ['tasks-as', 'globalreports']
        });
        done();
      });
    });

    it('should get the issues deploy info using the configured mapper', (done) => {
      const githubDummy  = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      const servicesMap = {
        globalreports: {
          'node-version': 'v0.10.24',
          statics: true,
          deploy: ['globalreports']
        },
        'tasks-as': {
          'node-version': 'v0.10.24',
          statics: true,
          deploy: ['tasks']
        }
      };
      const configDummy = {
        services: {
          mapper: service => {
            return servicesMap[service];
          }
        }
      };

      stub.onFirstCall().callsArgWith(1, null, [{ name: 'deploy-to:tasks-as' }]);
      stub.onSecondCall().callsArgWith(1, null, [{ name: 'deploy-to:globalreports' }]);
      const prDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(prDeployInfo, configDummy);
      deployInfoFromPullRequests([1234, 4321], (err, info) => {
        info.should.be.eql({
          deployNotes: false,
          services: [
            { deploy: ['tasks'], 'node-version': 'v0.10.24', statics: true },
            { deploy: ['globalreports'], 'node-version': 'v0.10.24', statics: true }
          ]
        });
        done();
      });
    });

    it('should get the issues deploy info using the configured reducer', (done) => {
      const githubDummy  = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      const configDummy = {
        services: {
          reducer: (acc, service) => {
            if (!acc) acc = {};
            acc[service] = true;
            return acc;
          }
        }
      };

      stub.onFirstCall().callsArgWith(1, null, [{ name: 'deploy-to:tasks-as' }]);
      stub.onSecondCall().callsArgWith(1, null, [{ name: 'deploy-to:globalreports' }]);
      const prDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(prDeployInfo, configDummy);
      deployInfoFromPullRequests([1234, 4321], (err, info) => {
        info.should.be.eql({
          deployNotes: false,
          services: {
            globalreports: true,
            'tasks-as': true
          }
        });
        done();
      });
    });

    it('should get the issues deploy info using the configured mapper and reducer', (done) => {
      const githubDummy  = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      const configDummy = {
        services: {
          mapper: service => {
            return service + '-service';
          },
          reducer: (acc, service) => {
            if (!acc) acc = {};
            acc[service] = true;
            return acc;
          }
        }
      };

      stub.onFirstCall().callsArgWith(1, null, [{ name: 'deploy-to:tasks-as' }]);
      stub.onSecondCall().callsArgWith(1, null, [{ name: 'deploy-to:globalreports' }]);
      const prDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(prDeployInfo, configDummy);
      deployInfoFromPullRequests([1234, 4321], (err, info) => {
        info.should.be.eql({
          deployNotes: false,
          services: {
            'globalreports-service': true,
            'tasks-as-service': true
          }
        });
        done();
      });
    });
  });
});
