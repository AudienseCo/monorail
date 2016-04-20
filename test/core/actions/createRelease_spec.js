'use strict';

const sinon  = require('sinon');
const should = require('should');

const createCreateRelease = require('../../../core/actions/createRelease');
const createReleaseService = require('../../../services/releaseService');
const createBoundIssueExtractor = require('../../../services/boundIssueExtractor');

describe('Create release action', () => {
  const boundIssueExtractor = createBoundIssueExtractor();

  context('Interface', () => {
    const createRelease = createCreateRelease();
    it('should be a function', () => {
      createRelease.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    function createGithubDummy(prInfo, issueInfo) {
      return {
        getPullRequest: (id, cb) => {
          cb(null, prInfo);
        },
        getIssue: (id, cb) => {
          cb(null, issueInfo);
        },
        createRelease: (info, cb) => {
          cb();
        }
      };
    }

    let githubDummy;
    beforeEach(() => {
      const prInfo = { title: 'Foo PR', body: 'Closes #1234' };
      const issueInfo = { number: 1234, title: 'Bar issue' };
      githubDummy = createGithubDummy(prInfo, issueInfo);
    });

    it('should fetch the PR info', done => {
      const releaseService = createReleaseService(githubDummy);
      const createRelease = createCreateRelease(githubDummy, boundIssueExtractor, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const spy = sinon.spy(githubDummy, 'getPullRequest');

      createRelease(tag, ids, err => {
        should.not.exist(err);
        spy.calledWith(1).should.be.ok();
        done();
      });
    });

    it('should extract the bound issues', done => {
      const releaseService = createReleaseService(githubDummy);
      const createRelease = createCreateRelease(githubDummy, boundIssueExtractor, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const spy = sinon.spy(boundIssueExtractor, 'extract');

      createRelease(tag, ids, err => {
        should.not.exist(err);
        spy.calledWith('Closes #1234').should.be.ok();
        done();
      });
    });

    it('should fetch the bound issues info', done => {
      const releaseService = createReleaseService(githubDummy);
      const createRelease = createCreateRelease(githubDummy, boundIssueExtractor, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const spy = sinon.spy(githubDummy, 'getIssue');

      createRelease(tag, ids, err => {
        should.not.exist(err);
        spy.calledWith('1234').should.be.ok();
        done();
      });
    });

    it('should create the release with the issues info', done => {
      const releaseService = createReleaseService(githubDummy);
      const createRelease = createCreateRelease(githubDummy, boundIssueExtractor, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const spy = sinon.spy(githubDummy, 'createRelease');

      createRelease(tag, ids, err => {
        should.not.exist(err);
        spy.calledWith({
          tag_name: 'v1.2.3',
          name: 'v1.2.3 Release',
          body: '#1234 Bar issue'
        }).should.be.ok();
        done();
      });
    });

    context('Error handling', () => {

      it('should return an error when fetching PR info fails', done => {
        sinon.stub(githubDummy, 'getPullRequest', (id, cb) => {
          cb('foo_error');
        });
        const releaseService = createReleaseService(githubDummy);
        const createRelease = createCreateRelease(githubDummy, boundIssueExtractor, releaseService);
        const tag = 'v1.2.3';
        const ids = [1];

        createRelease(tag, ids, err => {
          err.should.be.eql('foo_error');
          done();
        });
      });

      it('should return an error when fetching Issue info fails', done => {
        sinon.stub(githubDummy, 'getIssue', (id, cb) => {
          cb('foo_error');
        });
        const releaseService = createReleaseService(githubDummy);
        const createRelease = createCreateRelease(githubDummy, boundIssueExtractor, releaseService);
        const tag = 'v1.2.3';
        const ids = [1];

        createRelease(tag, ids, err => {
          err.should.be.eql('foo_error');
          done();
        });
      });

      it('should return an error when creating the release fails', done => {
        sinon.stub(githubDummy, 'createRelease', (id, cb) => {
          cb('foo_error');
        });
        const releaseService = createReleaseService(githubDummy);
        const createRelease = createCreateRelease(githubDummy, boundIssueExtractor, releaseService);
        const tag = 'v1.2.3';
        const ids = [1];

        createRelease(tag, ids, err => {
          err.should.be.eql('foo_error');
          done();
        });
      });
    });
  });
});