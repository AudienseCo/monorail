'use strict';

require('should');
const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');

describe('Get pull request deploy info', () => {
  context('Interface', () => {

    const prDeployInfo = createPullRequestDeployInfo();

    it('should have the "get" method', () => {
      prDeployInfo.get.should.be.a.Function();
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

    it('should get if the issue has deploy notes', (done) => {
      const githubDummy = createGithubDummy([{ name: 'Deploy notes' }]);
      const prDeployInfo = createPullRequestDeployInfo(githubDummy);

      prDeployInfo.get(1234, (err, info) => {
        info.deployNotes.should.be.ok();
        done();
      });
    });

    it('should get the services to deploy', (done) => {
      const githubDummy = createGithubDummy([
        { name: 'deploy-to:globalreports'},
        { name: 'deploy-to:sync-as'}
      ]);
      const prDeployInfo = createPullRequestDeployInfo(githubDummy);

      prDeployInfo.get(1234, (err, info) => {
        info.services.should.be.eql(['globalreports', 'sync-as']);
        done();
      });
    });
  });
});
