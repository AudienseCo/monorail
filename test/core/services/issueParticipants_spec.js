'use strict';

require('should');

const createIssueParticipants = require('../../../core/services/issueParticipants');

describe('issueParticipants service', () => {

  context('Interface', () => {
    const issueParticipants = createIssueParticipants();
    it('should have the "getParticipants" method', () => {
      issueParticipants.getParticipants.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    function createGithubDummy(result) {
      return {
        getIssueComments: (issue, cb) => {
          cb(null, result);
        }
      };
    }

    it('should get the issue author name as least', done => {
      const comments = [];
      const githubDummy = createGithubDummy(comments);
      const issueParticipants = createIssueParticipants(githubDummy);
      const issueItem = {
        number: 1234,
        user: {
          login: 'foo'
        }
      };
      issueParticipants.getParticipants(issueItem, (err, participants) => {
        participants.should.be.eql(['foo']);
        done();
      });
    });

    it('should get the list of people who commented the PR', done => {
      const comments = [
        {
          id: 2,
          user: {
            login: 'bar'
          }
        }
      ];
      const githubDummy = createGithubDummy(comments);
      const issueParticipants = createIssueParticipants(githubDummy);
      const issueItem = {
        number: 1234,
        user: {
          login: 'foo'
        }
      };
      issueParticipants.getParticipants(issueItem, (err, participants) => {
        participants.should.be.eql(['foo', 'bar']);
        done();
      });
    });

    it('should get the list of people who commented the PR (avoid duplicates)', done => {
      const comments = [
        {
          id: 1,
          user: {
            login: 'foo'
          }
        },
        {
          id: 2,
          user: {
            login: 'bar'
          }
        },
        {
          id: 3,
          user: {
            login: 'bar'
          }
        }
      ];
      const githubDummy = createGithubDummy(comments);
      const issueParticipants = createIssueParticipants(githubDummy);
      const issueItem = {
        number: 1234,
        user: {
          login: 'foo'
        }
      };

      issueParticipants.getParticipants(issueItem, (err, participants) => {
        participants.length.should.be.eql(2);
        participants.should.be.eql(['foo', 'bar']);
        done();
      });
    });

  });
});
