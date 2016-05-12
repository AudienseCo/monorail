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

    it('should get the list of people mapped using the config', done => {
      const config = {
        users: {
          map: user => {
            return '@' + user;
          }
        }
      };
      const issueItem = {
        number: 1234,
        user: {
          login: 'foo'
        }
      };
      const comments = [
        {
          id: 2,
          user: {
            login: 'bar'
          }
        }
      ];

      const githubDummy = createGithubDummy(comments);
      const issueParticipants = createIssueParticipants(githubDummy, config);

      issueParticipants.getParticipants(issueItem, (err, participants) => {
        participants.should.be.eql(['@foo', '@bar']);
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

    it('should get the participants for a list of issues', done => {
      const comments = [
        {
          id: 1,
          user: {
            login: 'john'
          }
        },
        {
          id: 2,
          user: {
            login: 'ana'
          }
        }
      ];
      const githubDummy = createGithubDummy(comments);
      const issueParticipants = createIssueParticipants(githubDummy);
      const issues = [
        {
          number: 1234,
          user: {
            login: 'foo'
          }
        },
        {
          number: 4321,
          user: {
            login: 'bar'
          }
        }
      ];

      issueParticipants.getParticipants(issues, (err, participants) => {
        participants.length.should.be.eql(4);
        participants.should.be.eql(['foo', 'john', 'ana', 'bar']);
        done();
      });
    });

  });
});
