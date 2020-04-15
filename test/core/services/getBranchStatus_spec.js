'use scrict';

const should = require('should');
const sinon = require('sinon');
const createGetBranchStatus = require('../../../core/services/getBranchStatus');
const POLLING_INTERVAL_MS = 1;

describe('get branch status service', () => {
  it('should succeed when no checks required', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksError: {
        status: 404
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

  it('should fail when branch is not found', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy({
      status: 404
    }, {
      getBranchRes: {
        object: {}
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.exists(err);
      githubDummy.wasCalled('getProtectedBranchRequiredStatusChecks').should.not.be.true();
      done();
    });
  });

  it('shouldnt call gitCheckForRef when no checks required', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksError: {
        status: 404
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.not.exists(err);
      sha.should.be.eql(aSha);
      githubDummy.wasCalled('gitCheckForRef').should.not.be.true();
      done();
    });
  });

  it('should fail when github reply with status not equal to 200 or 404', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksError: {
        status: 403
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy, POLLING_INTERVAL_MS);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.exists(err);
      done();
    });
  });


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

  it.skip('should wait when one of the require checks is not completed', (done) => {
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

  function createGithubDummy(err, {
    getBranchRes,
    getProtectedBranchRequiredStatusChecksRes,
    getChecksForRefRes,
    getProtectedBranchRequiredStatusChecksError
  }) {
    var calls = [];
    function called(name, cb) {
      calls.push(name);
    }
    function wasCalled(name) {
      return calls.includes(name)
    }
    return {
      getBranch: (repo, branch, cb) => called('getBranch', cb(err, getBranchRes)),
      getProtectedBranchRequiredStatusChecks: (repo, branch, cb) => called('getProtectedBranchRequiredStatusChecks', cb(getProtectedBranchRequiredStatusChecksError, getProtectedBranchRequiredStatusChecksRes)),
      getChecksForRef: (repo, ref, cb) => called('getChecksForRefRes', cb(err, getChecksForRefRes)),
      wasCalled: wasCalled
    };
  }
});
