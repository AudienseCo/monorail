'use scrict';

const should = require('should');
const sinon = require('sinon');
const createGetBranchStatus = require('../../../core/services/getBranchStatus');

describe('get branch status service', () => {
  it('should succeed when branch exists', (done) => {
    const aSha = '123';
    const githubDummy = createGithubDummy(null, {
      getBranchRes: {
        object: {
          sha: aSha
        }
      }
    });
    const getBranchStatus = createGetBranchStatus(githubDummy);

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
    const getBranchStatus = createGetBranchStatus(githubDummy);

    const repo = 'audienseCo';
    const branch = 'staging';
    getBranchStatus(repo, branch, (err, sha) => {
      should.exists(err);
      done();
    });
  });


  function createGithubDummy(err, {
    getBranchRes,
  }) {
    return {
      getBranch: (repo, branch, cb) => cb(err, getBranchRes),
    };
  }
});
