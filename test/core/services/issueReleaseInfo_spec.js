'use strict';

require('should');
const sinon = require('sinon');

const createIssueReleaseInfo = require('../../../core/services/issueReleaseInfo');
const createBoundIssueExtractor = require('../../../core/services/boundIssueExtractor');

const boundIssueExtractor = createBoundIssueExtractor();

function createIssueParticipantsDummy(result) {
  return {
    getParticipants: (issues, cb) => {
      cb(null, result);
    }
  };
}

function createGithubDummy(pr, issue) {
  const that = {
    getIssue: (number, cb) => {
      cb(null, issue);
    }
  };
  sinon.stub(that, 'getIssue')
        .onCall(0).callsArgWith(1, null, pr)
        .onCall(1).callsArgWith(1, null, issue);
  return that;
}

describe('issueReleaseInfo service', () => {
  context('Interface', () => {
    const issueReleaseInfo = createIssueReleaseInfo();

    it('should have the "getInfo" method', () => {
      issueReleaseInfo.getInfo.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    it('should return the bound issue', done => {
      const githubDummy = createGithubDummy({
        number: 1234,
        title: 'Foo PR',
        body: 'Closes #4321'
      }, {
        number: 4321,
        title: 'Bar issue'
      });
      const issueParticipantsDummy = createIssueParticipantsDummy([]);
      const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
        issueParticipantsDummy);
      issueReleaseInfo.getInfo(1234, (err, info) => {
        info.issue.should.be.eql({
          number: 4321,
          title: 'Bar issue'
        });
        done();
      });
    });

    it('should return the PR info if there is not any bound issue', done => {
      const githubDummy = createGithubDummy({
        number: 1234,
        title: 'Foo PR',
        body: 'blabla'
      }, null);
      const issueParticipantsDummy = createIssueParticipantsDummy([]);
      const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
        issueParticipantsDummy);
      issueReleaseInfo.getInfo(1234, (err, info) => {
        info.issue.should.be.eql({
          number: 1234,
          title: 'Foo PR',
          body: 'blabla'
        });
        done();
      });
    });

    it('should return the participants', done => {
      const githubDummy = createGithubDummy({
        number: 1234,
        title: 'Foo PR',
        body: 'blabla'
      }, null);
      const issueParticipantsDummy = createIssueParticipantsDummy(['ana', 'joe']);
      const issueReleaseInfo = createIssueReleaseInfo(githubDummy, boundIssueExtractor,
        issueParticipantsDummy);
      issueReleaseInfo.getInfo(1234, (err, info) => {
        info.participants.should.be.eql(['ana', 'joe']);
        done();
      });
    });
  });
});
