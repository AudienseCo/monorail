'use strict';

const should = require('should');
const sinon = require('sinon');
const createPreviewRelease = require('../../../core/actions/previewReleaseV2');
const createIssuesFromPullRequests = require('../../../core/services/issuesFromPullRequests');
const createPullRequestsFromChanges = require('../../../core/services/pullRequestsFromChanges');
const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createDeployInfoFromPullRequests = require('../../../core/services/deployInfoFromPullRequests');

describe('previewRelease action', () => {

  context('Interface', () => {
    const previewRelease = createPreviewRelease();

    it('should should be a function', () => {
      previewRelease.should.be.a.Function();
    });

  });

  context('Behaviour', () => {

    function createGithubDummy(prInfo, issueInfo, commitsInfo, labelsInfo) {
      return {
        getPullRequest: (id, cb) => {
          cb(null, prInfo);
        },
        getIssue: (id, cb) => {
          cb(null, issueInfo);
        },
        compareCommits: (info, cb) => {
          cb(null, commitsInfo);
        },
        getIssueLabels: (id, cb) => {
          cb(null, labelsInfo);
        }
      };
    }

    it('should return the list of affected issues from a list of pull requests', done => {
      const configDummy = {};
      const prInfo = { title: 'Foo PR', body: 'Closes #4321' };
      const issueInfo = { number: 4321, title: 'Bar issue' };
      const commitsInfo = {
        commits: [
          {
            commit: {
              message: 'Merge pull request #1234'
            }
          }
        ]
      };
      const githubDummy = createGithubDummy(prInfo, issueInfo, commitsInfo);
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      stub.onFirstCall().callsArgWith(1, null, [{ name: 'deploy-to:tasks-as' }]);
      stub.onSecondCall().callsArgWith(1, null, [{ name: 'deploy-to:globalreports' }]);

      const issuesFromPullRequests = createIssuesFromPullRequests(githubDummy);
      const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy);
      const pullRequestDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(pullRequestDeployInfo, configDummy);
      const previewRelease = createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests);

      const expectedPullRequestList = ['1234'];
      const expectedIssues = [
        {
          number: 4321,
          title: 'Bar issue'
        }
      ];
      const expectedDeployInfo = {
        deployNotes: false,
        services: [ 'tasks-as' ]
      };

      previewRelease((err, pullRequestList, issues, deployInfo) => {
        should.not.exist(err);
        expectedPullRequestList.should.be.eql(expectedPullRequestList);
        issues.should.be.eql(expectedIssues);
        deployInfo.should.be.eql(expectedDeployInfo);
        done();
      });
    });
  });
});
