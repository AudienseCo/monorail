'use scrict';

const should = require('should');
const sinon = require('sinon');

const createGetRepoConfig = require('../../../core/services/getRepoConfig');

describe('getRepoConfig service', () => {
  it('should return an error if any of the github operation fails', (done) => {
    const githubDummy = createGithubDummy(new Error('dummy error'));
    const configDummy = createConfigDummy();
    const getRepoConfig = createGetRepoConfig(githubDummy, configDummy);

    const repo = '123';
    getRepoConfig(repo, (err) => {
      should.exist(err);
      done();
    });
  });

  it('should handle malformed repo config files', (done) => {
    const githubDummy = createGithubDummy(null, {
      content: 'byBiYXNlNjQgZW5jb2RlZCB3b3JsZCIgfQ=='
    });
    const configDummy = createConfigDummy();
    const getRepoConfig = createGetRepoConfig(githubDummy, configDummy);

    const repo = '123';
    getRepoConfig(repo, (err, config) => {
      should.exist(err);
      err.message.should.be.eql('Invalid config file');
      done();
    });
  });


  it('should get the repo config file', (done) => {
    const githubDummy = createGithubDummy(null, {
      content: 'eyAidGV4dCI6ICJoZWxsbyBiYXNlNjQgZW5jb2RlZCB3b3JsZCIgfQ=='
    });
    const githubSpy = sinon.spy(githubDummy, 'getContent');
    const configDummy = createConfigDummy();
    const getRepoConfig = createGetRepoConfig(githubDummy, configDummy);

    const repo = '123';
    getRepoConfig(repo, (err, config) => {
      should.not.exist(err);
      githubSpy.withArgs(repo, '.monorail').calledOnce.should.be.ok();
      config.should.be.eql({ text: 'hello base64 encoded world' });
      done();
    });
  });

  function createGithubDummy(err, res) {
    return {
      getContent: (repo, path, ref, cb) => cb(err, res)
    };
  }

  function createConfigDummy() {
    return {
      github: {
        masterBranch: 'master'
      }
    };
  }
});
