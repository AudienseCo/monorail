'use scrict';

const should = require('should');
const sinon = require('sinon');
const createGetBranchStatus = require('../../../core/services/getBranchStatus');
const POLLING_INTERVAL_MS = 1;

describe('get branch status service', () => {
  it('should succeed when no checks required or executed', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksRes: {
        contexts: []
      },
      getChecksForRefRes: {
        check_runs: []
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.not.exists(err);
      sha.should.be.eql(aSha);
      done();
    });
  });

  it('should succeed when all require checks have succeed and are completed', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksRes: {
        contexts: ['check1']
      },
      getChecksForRefRes: {
        check_runs: [
          { name: 'check1', status: 'completed', conclusion: 'success' },
          { name: 'check2', status: 'completed', conclusion: 'failed' }
        ]
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.not.exists(err);
      sha.should.be.eql(aSha);
      done();
    });
  });

  it('should wait when one of the require checks is not completed', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksRes: {
        contexts: ['check1', 'check3']
      },
      getChecksForRefRes: null
    });
    const stub = sinon.stub(githubDummy, 'getChecksForRef');
    stub.onFirstCall().callsArgWith(2, null, {
      check_runs: [
        { name: 'check1', status: 'completed', conclusion: 'success' },
        { name: 'check2', status: 'completed', conclusion: 'failed' },
        { name: 'check3', status: 'pending', conclusion: '' },
      ]
    });
    stub.onSecondCall().callsArgWith(2, null, {
      check_runs: [
        { name: 'check1', status: 'completed', conclusion: 'success' },
        { name: 'check2', status: 'completed', conclusion: 'failed' },
        { name: 'check3', status: 'completed', conclusion: 'success' },
      ]
    });

    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.not.exists(err);
      sha.should.be.eql(aSha);
      done();
    });
  });

  it('should fail when one of the require checks failed', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksRes: {
        contexts: ['check1', 'check3']
      },
      getChecksForRefRes: {
        check_runs: [
          { name: 'check1', status: 'completed', conclusion: 'success' },
          { name: 'check2', status: 'completed', conclusion: 'failed' },
          { name: 'check3', status: 'completed', conclusion: 'failed' }
        ]
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.exists(err);
      err.message.should.be.eql('CHECKS_FAILED');
      done();
    });
  });

  it('should fail when the last execution of one of the require checks failed although previous succeeded', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksRes: {
        contexts: ['check1', 'check3']
      },
      getChecksForRefRes: {
        check_runs: [
          { name: 'check1', status: 'completed', conclusion: 'failed' },
          { name: 'check2', status: 'completed', conclusion: 'failed' },
          { name: 'check3', status: 'completed', conclusion: 'success' },
          { name: 'check1', status: 'completed', conclusion: 'success' }
        ]
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.exists(err);
      err.message.should.be.eql('CHECKS_FAILED');
      done();
    });
  });

  it('should succeed when the last execution of all of the require checks succeeded although previous failed', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksRes: {
        contexts: ['check1', 'check3']
      },
      getChecksForRefRes: {
        check_runs: [
          { name: 'check1', status: 'completed', conclusion: 'success' },
          { name: 'check2', status: 'completed', conclusion: 'failed' },
          { name: 'check3', status: 'completed', conclusion: 'success' },
          { name: 'check1', status: 'completed', conclusion: 'failed' }
        ]
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.not.exists(err);
      sha.should.be.eql(aSha);
      done();
    });
  });

  function createGithubDummy(err, { getBranchRes, getProtectedBranchRequiredStatusChecksRes, getChecksForRefRes }) {
    return {
      getBranch: (repo, branch, cb) => cb(err, getBranchRes),
      getProtectedBranchRequiredStatusChecks: (repo, branch, cb) => cb(err, getProtectedBranchRequiredStatusChecksRes),
      getChecksForRef: (repo, ref, cb) => cb(err, getChecksForRefRes)
    };
  }

});
