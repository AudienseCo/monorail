'use strict';

const sinon  = require('sinon');
const should = require('should');

const createCreateRelease = require('../../../core/actions/createRelease');
const createReleaseService = require('../../../core/services/releaseService');
const createBoundIssueExtractor = require('../../../core/services/boundIssueExtractor');
const createIssueReleaseInfo = require('../../../core/services/issueReleaseInfo');
const createReleaseNotesFormatter = require('../../../core/services/releaseNotesFormatter');
const createIssueReleaseInfoList = require('../../../core/services/issueReleaseInfoList');

describe('Create release action', () => {

  context('Interface', () => {
    const createRelease = createCreateRelease();
    it('should be a function', () => {
      createRelease.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    function createGithubDummy(prInfo, issueInfo) {
      const that = {
        getPullRequest: (repo, id, cb) => {
          cb(null, prInfo);
        },
        getIssue: (repo, id, cb) => {
          cb(null, issueInfo);
        },
        createRelease: (info, cb) => {
          cb();
        }
      };
      sinon.stub(that, 'getIssue')
        .onCall(0).callsArgWith(2, null, prInfo)
        .onCall(1).callsArgWith(2, null, issueInfo);
      return that;
    }
    const prInfo = { title: 'Foo PR', body: 'Closes #1234' };
    const issueInfo = { number: 1234, title: 'Bar issue' };
    let boundIssueExtractor;

    beforeEach(() => {
      boundIssueExtractor = createBoundIssueExtractor();
    });

    const issueParticipantsDummy = {
      getParticipants: (repo, issues, cb) => {
        cb(null, []);
      }
    };

    function createIssueReleaseInfoDummy(result) {
      return {
        getInfo: (repo, issue, cb) => {
          cb(null, result);
        }
      };
    }

    const releaseInfoLabel = {
      addLabels: (repo, info, labels, cb) => {
        cb();
      }
    };

    it('should fetch the PR info', done => {
      const githubDummy = createGithubDummy(prInfo, issueInfo);
      const releaseService = createReleaseService(githubDummy);
      const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
        issueParticipantsDummy);
      const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfo);
      const releaseNotesFormatter = createReleaseNotesFormatter();
      const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
        releaseNotesFormatter, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const repo = 'socialbro';

      createRelease(repo, tag, ids, err => {
        should.not.exist(err);
        githubDummy.getIssue.calledWith(repo, 1).should.be.ok();
        done();
      });
    });

    it('should extract the bound issues', done => {
      const githubDummy = createGithubDummy(prInfo, issueInfo);
      const releaseService = createReleaseService(githubDummy);
      const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
        issueParticipantsDummy);
      const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfo);
      const releaseNotesFormatter = createReleaseNotesFormatter();
      const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
        releaseNotesFormatter, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const spy = sinon.spy(boundIssueExtractor, 'extract');
      const repo = 'socialbro';

      createRelease(repo, tag, ids, err => {
        should.not.exist(err);
        spy.calledWith('Closes #1234').should.be.ok();
        done();
      });
    });

    it('should fetch the bound issues info', done => {
      const githubDummy = createGithubDummy(prInfo, issueInfo);
      const releaseService = createReleaseService(githubDummy);
      const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
        issueParticipantsDummy);
      const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfo);
      const releaseNotesFormatter = createReleaseNotesFormatter();
      const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
        releaseNotesFormatter, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const repo = 'socialbro';

      createRelease(repo, tag, ids, err => {
        should.not.exist(err);
        githubDummy.getIssue.calledWith(repo, '1234').should.be.ok();
        done();
      });
    });

    it('should mark the issues with the deployed label', done => {
      const githubDummy = createGithubDummy(prInfo, issueInfo);
      const releaseService = createReleaseService(githubDummy);
      const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
        issueParticipantsDummy);
      const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfo);
      const releaseNotesFormatter = createReleaseNotesFormatter();
      const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
        releaseNotesFormatter, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const spy = sinon.spy(releaseInfoLabel, 'addLabels');
      const repo = 'socialbro';

      createRelease(repo, tag, ids, err => {
        should.not.exist(err);
        spy.calledOnce.should.be.ok();
        done();
      });
    });

    it('should create the release with the issues info', done => {
      const githubDummy = createGithubDummy(prInfo, issueInfo);
      const releaseService = createReleaseService(githubDummy);
      const issueReleaseInfoDummy = createIssueReleaseInfoDummy({
        issue: { number: 1234, title: 'Bar issue' },
        participants: []
      });
      const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfoDummy);
      const releaseNotesFormatter = createReleaseNotesFormatter();
      const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
        releaseNotesFormatter, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const spy = sinon.spy(githubDummy, 'createRelease');
      const repo = 'socialbro';

      createRelease(repo, tag, ids, err => {
        should.not.exist(err);
        spy.calledWith({
          tag_name: 'v1.2.3',
          name: 'v1.2.3 Release',
          body: '#1234 Bar issue',
          repo
        }).should.be.ok();
        done();
      });
    });

    it('should include the participants', done => {
      const githubDummy = createGithubDummy(prInfo, issueInfo);
      const releaseService = createReleaseService(githubDummy);
      const issueReleaseInfoDummy = createIssueReleaseInfoDummy({
        issue: { number: 1234, title: 'Bar issue' },
        participants: ['ana', 'joe']
      });
      const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfoDummy);
      const releaseNotesFormatter = createReleaseNotesFormatter();
      const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
        releaseNotesFormatter, releaseService);
      const tag = 'v1.2.3';
      const ids = [1];
      const spy = sinon.spy(githubDummy, 'createRelease');
      const repo = 'socialbro';

      createRelease(repo, tag, ids, err => {
        should.not.exist(err);
        spy.calledWith({
          tag_name: 'v1.2.3',
          name: 'v1.2.3 Release',
          body: '#1234 Bar issue. cc ana, joe',
          repo
        }).should.be.ok();
        done();
      });
    });

    context('Error handling', () => {

      it('should return an error when fetching PR info fails', done => {
        const githubDummy = createGithubDummy(prInfo, issueInfo);
        githubDummy.getIssue.onCall(0).callsArgWith(2, 'foo_error');
        const releaseService = createReleaseService(githubDummy);
        const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
          issueParticipantsDummy);
        const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfo);
        const releaseNotesFormatter = createReleaseNotesFormatter();
        const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
          releaseNotesFormatter, releaseService);
        const tag = 'v1.2.3';
        const ids = [1];
        const repo = 'socialbro';

        createRelease(repo, tag, ids, err => {
          err.should.be.eql('foo_error');
          done();
        });
      });

      it('should return an error when fetching Issue info fails', done => {
        const githubDummy = createGithubDummy(prInfo, issueInfo);
        githubDummy.getIssue.onCall(1).callsArgWith(2, 'foo_error');
        const releaseService = createReleaseService(githubDummy);
        const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
          issueParticipantsDummy);
        const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfo);
        const releaseNotesFormatter = createReleaseNotesFormatter();
        const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
          releaseNotesFormatter, releaseService);
        const tag = 'v1.2.3';
        const ids = [1];
        const repo = 'socialbro';

        createRelease(repo, tag, ids, err => {
          err.should.be.eql('foo_error');
          done();
        });
      });

      it('should return an error when creating the release fails', done => {
        const githubDummy = createGithubDummy(prInfo, issueInfo);
        sinon.stub(githubDummy, 'createRelease', (id, cb) => {
          cb('foo_error');
        });
        const releaseService = createReleaseService(githubDummy);
        const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
          issueParticipantsDummy);
        const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfo);
        const releaseNotesFormatter = createReleaseNotesFormatter();
        const createRelease = createCreateRelease(issueReleaseInfoList, releaseInfoLabel,
          releaseNotesFormatter, releaseService);
        const tag = 'v1.2.3';
        const ids = [1];
        const repo = 'socialbro';

        createRelease(repo, tag, ids, err => {
          err.should.be.eql('foo_error');
          done();
        });
      });
    });
  });
});
