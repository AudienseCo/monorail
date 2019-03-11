'use strict';

const should = require('should');
const createIssuesFromPullRequests = require('../../../core/services/issuesFromPullRequests');

describe('issuesFromPullRequests service', () => {

  context('Interface', () => {
    const issuesFromPullRequests = createIssuesFromPullRequests();

    it('should should be a function', () => {
      issuesFromPullRequests.should.be.a.Function();
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
        }
      };
    }

    it('should return the list of affected issues from a list of pull requests', done => {
      const prInfo = { title: 'Foo PR', body: 'Closes #4321' };
      const issueInfo = { number: 4321, title: 'Bar issue' };
      const githubDummy = createGithubDummy(prInfo, issueInfo);
      const issuesFromPullRequests = createIssuesFromPullRequests(githubDummy);
      const expectedIssues = [
        {
          number: 4321,
          title: 'Bar issue'
        }
      ];

      const pullRequestList = ['1234'];
      issuesFromPullRequests(pullRequestList, (err, issues) => {
        should.not.exist(err);
        issues.should.be.eql(expectedIssues);
        done();
      });
    });
  });
});
