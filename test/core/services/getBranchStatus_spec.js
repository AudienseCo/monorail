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

  it('shouldnt call getStatusesForRef when no checks required', (done) => {
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
      githubDummy.wasCalled('getStatusesForRef').should.not.be.true();
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
        contexts: ['node/check1']
      },
      getStatusesForRefRes: [
        { context: 'node/check1', state: 'success'},
        { context: 'node/check2', state: 'failed'}
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

  it('should wait when one of the require checks is not completed', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      },
      getProtectedBranchRequiredStatusChecksRes: {
        contexts: ['node/check1', 'node/check3']
      },
      getStatusesForRefRes: null
    });
    const stub = sinon.stub(githubDummy, 'getStatusesForRef');
    stub.onFirstCall().callsArgWith(2, null, [
      { context: 'node/check1', state: 'success' },
      { context: 'node/check2', state: 'failed', },
      { context: 'node/check3', state: 'pending' },
    ]);
    stub.onSecondCall().callsArgWith(2, null, [
      { context: 'node/check1', state: 'success' },
      { context: 'node/check2', state: 'failed' },
      { context: 'node/check3', state: 'success' },
    ]);

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
        contexts: ['node/check1', 'node/check3']
      },
      getStatusesForRefRes: [
        { context: 'node/check1', state: 'success' },
        { context: 'node/check2', state: 'failed' },
        { context: 'node/check3', state: 'failed' }
      ]
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
        contexts: ['node/check1', 'node/check3']
      },
      getStatusesForRefRes: [
          { context: 'node/check1', state: 'failed' },
          { context: 'node/check2', state: 'failed' },
          { context: 'node/check3', state: 'success' },
          { context: 'node/check1', state: 'success' }
      ]
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
        contexts: ['node/check1', 'node/check3']
      },
      getStatusesForRefRes: [
        { context: 'node/check1', state: 'success' },
        { context: 'node/check2', state: 'failed' },
        { context: 'node/check3', state: 'success' },
        { context: 'node/check1', state: 'failed' }
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

  function createGithubDummy(err, {
    getBranchRes,
    getProtectedBranchRequiredStatusChecksRes,
    getStatusesForRefRes,
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
      getStatusesForRef: (repo, ref, cb) => called('getStatusesForRefRes', cb(err, getStatusesForRefRes)),
      wasCalled: wasCalled
    };
  }
});
