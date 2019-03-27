'use scrict';

const should = require('should');
const sinon = require('sinon');

const createMergeDeployBranch = require('../../../core/services/mergeDeployBranch');

describe('mergeDeployBranch service', () => {
  it('should trigger github errors', (done) => {
    const githubDummy = createGithubDummy(new Error('dummy error'));
    const mergeDeployBranch = createMergeDeployBranch(githubDummy);

    const repo = '123';
    const masterBranch = 'master';
    const devBranch = 'dev';
    const deployBranch = 'deploy-123';
    mergeDeployBranch(repo, masterBranch, devBranch, deployBranch, (err) => {
      should.exists(err);
      done();
    });
  });

  it('should merge deploy branch into master', (done) => {
    const githubDummy = createGithubDummy();
    const spy = sinon.spy(githubDummy, 'merge');
    const mergeDeployBranch = createMergeDeployBranch(githubDummy);

    const repo = '123';
    const masterBranch = 'master';
    const devBranch = 'dev';
    const deployBranch = 'deploy-123';
    mergeDeployBranch(repo, masterBranch, devBranch, deployBranch, (err) => {
      should.not.exists(err);
      spy.withArgs(repo, masterBranch, deployBranch).calledOnce.should.be.ok();
      done();
    });
  });

  it('should merge deploy branch into dev', (done) => {
    const githubDummy = createGithubDummy();
    const spy = sinon.spy(githubDummy, 'merge');
    const mergeDeployBranch = createMergeDeployBranch(githubDummy);

    const repo = '123';
    const masterBranch = 'master';
    const devBranch = 'dev';
    const deployBranch = 'deploy-123';
    mergeDeployBranch(repo, masterBranch, devBranch, deployBranch, (err) => {
      should.not.exists(err);
      spy.withArgs(repo, devBranch, deployBranch).calledOnce.should.be.ok();
      done();
    });
  });

  it('should remove the deploy branch', (done) => {
    const githubDummy = createGithubDummy();
    const spy = sinon.spy(githubDummy, 'removeBranch');
    const mergeDeployBranch = createMergeDeployBranch(githubDummy);

    const repo = '123';
    const masterBranch = 'master';
    const devBranch = 'dev';
    const deployBranch = 'deploy-123';
    mergeDeployBranch(repo, masterBranch, devBranch, deployBranch, (err) => {
      should.not.exists(err);
      spy.withArgs(repo, deployBranch).calledOnce.should.be.ok();
      done();
    });
  });

  function createGithubDummy(err, res) {
    return {
      merge: (repo, base, head, cb) => cb(err, cb),
      removeBranch: (repo, branch, cb) => cb(err, res)
    };
  }

});
