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

  it('should tell which merge failed and why', (done) => {
    const conflict = new Error('Merge conflict');
    conflict.status = 409;
    const githubDummy = createGithubDummy(conflict);
    const mergeDeployBranch = createMergeDeployBranch(githubDummy);

    mergeDeployBranch('123', 'master', 'dev', 'deploy-123', (err) => {
      should.exists(err);
      err.message.should.be.eql('Error merging deploy-123 into master: Merge conflict (HTTP 409)');
      err.status.should.be.eql(409);
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
