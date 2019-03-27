'use scrict';

const should = require('should');
const sinon = require('sinon');

const createCreateDeployTemporaryBranch = require('../../../core/services/createDeployTemporaryBranch');

describe('createDeployTemporaryBranch service', () => {
  const clock = {
    now: () => 123
  };

  it('should return error if branch creation fails', (done) => {
    const dummyGithub = createGithubDummy(new Error('dummy error'));
    createDeployTemporaryBranch = createCreateDeployTemporaryBranch(dummyGithub, clock);
    const repo = '456';
    createDeployTemporaryBranch(repo, (err, branchName) => {
      should.exist(err);
      done();
    });
  });

  it('should create a temporary branch', (done) => {
    const dummyGithub = createGithubDummy(null, { object: { sha: 'abc' }});
    const githubSpy = sinon.spy(dummyGithub, 'createBranch');
    createDeployTemporaryBranch = createCreateDeployTemporaryBranch(dummyGithub, clock);
    const repo = '456';
    createDeployTemporaryBranch(repo, (err, branchName) => {
      should.not.exist(err);
      githubSpy.withArgs(repo, 'deploy-123', 'abc').calledOnce.should.be.ok();
      branchName.should.be.eql('deploy-123');
      done();
    });
  });

  function createGithubDummy(err, res) {
    return {
      getBranch: (repo, branch, cb) => cb(err, res),
      createBranch: (repo, branch, sha, cb) => cb(err, { name: branch })
    };
  }

});
