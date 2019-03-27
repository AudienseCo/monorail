'use scrict';

const should = require('should');
const sinon = require('sinon');
const createCleanUpDeploy = require('../../../core/services/cleanUpDeploy');

describe('cleanUpDeploy service', () => {
  it('should return an error if any of the github operation fails', (done) => {
    const githubDummy = createGithubDummy(new Error('dummy error'));
    const cleanUpDeploy = createCleanUpDeploy(githubDummy);
    const repoInfo = {
      repo: '123',
      branch: 'deploy-123',
      tag: '1.5'
    };
    cleanUpDeploy(repoInfo, (err) => {
      should.exist(err);
      done();
    });
  });

  it('should remove the temporary branch', (done) => {
    const githubDummy = createGithubDummy();
    const githubSpy = sinon.spy(githubDummy, 'removeBranch');
    const cleanUpDeploy = createCleanUpDeploy(githubDummy);
    const repoInfo = {
      repo: '123',
      branch: 'deploy-123',
      tag: '1.5'
    };
    cleanUpDeploy(repoInfo, (err) => {
      should.not.exist(err);
      githubSpy.withArgs(repoInfo.repo, repoInfo.branch).calledOnce.should.be.ok();
      done();
    });
  });

  it('should remove the tag', (done) => {
    const githubDummy = createGithubDummy();
    const githubSpy = sinon.spy(githubDummy, 'removeTag');
    const cleanUpDeploy = createCleanUpDeploy(githubDummy);
    const repoInfo = {
      repo: '123',
      branch: 'deploy-123',
      tag: '1.5'
    };
    cleanUpDeploy(repoInfo, (err) => {
      should.not.exist(err);
      githubSpy.withArgs(repoInfo.repo, repoInfo.tag).calledOnce.should.be.ok();
      done();
    });
  });

  function createGithubDummy(err, res) {
    return {
      removeBranch: (repo, branch, cb) => cb(err, cb),
      removeTag: (repo, branch, cb) => cb(err, cb)
    };
  }

});
