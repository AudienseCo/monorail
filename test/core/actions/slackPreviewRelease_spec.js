'use strict';

const should = require('should');
const sinon = require('sinon');
const createPreviewRelease = require('../../../core/actions/slackPreviewRelease');
const createIssuesFromPullRequests = require('../../../core/services/issuesFromPullRequests');
const createPullRequestsFromChanges = require('../../../core/services/pullRequestsFromChanges');
const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createDeployInfoFromPullRequests = require('../../../core/services/deployInfoFromPullRequests');

describe('slackPreviewRelease action', () => {

  context('Interface', () => {
    const previewRelease = createPreviewRelease();

    it('should should be a function', () => {
      previewRelease.should.be.a.Function();
    });

  });

  context('Behaviour', () => {
    const repos = ['socialbro'];

    it('should notify a NO_CHANGES error if there are no changes', done => {
      const configDummy = {};
      const prInfo = {};
      const issueInfo = {};
      const commitsInfo = {
        commits: []
      };
      const githubDummy = createGithubDummy(prInfo, issueInfo, commitsInfo);

      const issuesFromPullRequests = createIssuesFromPullRequests(githubDummy);
      const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy, configDummy);
      const pullRequestDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(pullRequestDeployInfo, configDummy);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slackDummy, repos);

      previewRelease((err) => {
        should.not.exist(err);
        const expectedMsg = {
          pretext: '',
          text: 'Monorail will not deploy anything in the next 10 minutes as there are no changes to deploy.'
        };
        slackSpy.withArgs(expectedMsg).calledOnce.should.be.true();
        done();
      });
    });

    it('should notify a DEPLOY_NOTES error if there is a PR with deploy notes label', done => {
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
      stub.onFirstCall().callsArgWith(2, null, [{ name: 'deploy notes' }]);
      stub.onSecondCall().callsArgWith(2, null, [{ name: 'deploy-to:globalreports' }]);

      const issuesFromPullRequests = createIssuesFromPullRequests(githubDummy);
      const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy, configDummy);
      const pullRequestDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(pullRequestDeployInfo, configDummy);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slackDummy, repos);

      previewRelease((err) => {
        should.not.exist(err);
        const expectedMsg = {
          pretext: '',
          text: 'Monorail will not deploy anything in the next 10 minutes as there are deployNotes.'
        };
        slackSpy.withArgs(expectedMsg).calledOnce.should.be.true();
        done();
      });
    });

    it('should notify a NO_SERVICES error if there are no deploy labels added to the PRs', done => {
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
      stub.onFirstCall().callsArgWith(2, null, []);
      stub.onSecondCall().callsArgWith(2, null, []);

      const issuesFromPullRequests = createIssuesFromPullRequests(githubDummy);
      const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy, configDummy);
      const pullRequestDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(pullRequestDeployInfo, configDummy);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slackDummy, repos);

      previewRelease((err) => {
        should.not.exist(err);
        const expectedMsg = {
          pretext: '',
          text: 'Monorail will not deploy anything in the next 10 minutes because the list of services is empty.'
        };
        slackSpy.withArgs(expectedMsg).calledOnce.should.be.true();
        done();
      });
    });

    it('should notify the release preview with PRs, issues and deploy info', done => {
      const servicesMap = {
        globalreports: {
          nodeVersion: 'v0.10.24',
          statics: true,
          deploy: ['globalreports']
        },
        'tasks-as': {
          nodeVersion: 'v0.10.24',
          statics: true,
          deploy: ['tasks']
        }
      };
      const configDummy = {
        services: {
          mapper: service => {
            return servicesMap[service];
          }
        }
      };
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
      stub.onFirstCall().callsArgWith(2, null, [{ name: 'deploy-to:tasks-as' }]);
      stub.onSecondCall().callsArgWith(2, null, [{ name: 'deploy-to:globalreports' }]);

      const issuesFromPullRequests = createIssuesFromPullRequests(githubDummy);
      const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy, configDummy);
      const pullRequestDeployInfo = createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequests = createDeployInfoFromPullRequests(pullRequestDeployInfo, configDummy);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slackDummy, repos);

      previewRelease((err) => {
        should.not.exist(err);
        const expectedMsg = {
          pretext: '',
          text: 'Repository: socialbro\n\nPull Requests: 1234\n\nNode version: v0.10.24\nServices: tasks\n\n\nIssues:\n<https://github.com/AudienseCo/socialbro/issues/4321|#4321> Bar issue\n\n\n\n'
        };
        slackSpy.withArgs(expectedMsg).calledOnce.should.be.true();
        done();
      });
    });

    function createGithubDummy(prInfo, issueInfo, commitsInfo, labelsInfo) {
      return {
        getPullRequest: (repo, id, cb) => {
          cb(null, prInfo);
        },
        getIssue: (repo, id, cb) => {
          cb(null, issueInfo);
        },
        compareCommits: (info, cb) => {
          cb(null, commitsInfo);
        },
        getIssueLabels: (repo, id, cb) => {
          cb(null, labelsInfo);
        }
      };
    }

    function createSlackDummy() {
      return {
        send: (msg, cb) => {
          cb(null, {});
        }
      };
    }

  });
});
