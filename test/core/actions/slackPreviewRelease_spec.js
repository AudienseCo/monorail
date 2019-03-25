'use strict';

const should = require('should');
const sinon = require('sinon');
const createPreviewRelease = require('../../../core/actions/slackPreviewRelease');
const createIssuesFromPullRequests = require('../../../core/services/issuesFromPullRequests');
const createPullRequestsFromChanges = require('../../../core/services/pullRequestsFromChanges');
const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createDeployInfoFromPullRequests = require('../../../core/services/deployInfoFromPullRequests');
const createGetReleasePreview = require('../../../core/services/getReleasePreview');

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
      const getReleasePreview = createGetReleasePreview(pullRequestsFromChanges, deployInfoFromPullRequests, issuesFromPullRequests);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPreviewRelease(getReleasePreview, slackDummy, repos);

      previewRelease((err) => {
        should.not.exist(err);
        const expectedMsg = {
          attachments: [ {
            text: 'Monorail will not deploy anything in the next 10 minutes as there are no changes to deploy.',
            color: '#439FE0',
            title: 'socialbro',
            title_link: 'https://github.com/AudienseCo/socialbro'
          } ]
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
      const getReleasePreview = createGetReleasePreview(pullRequestsFromChanges, deployInfoFromPullRequests, issuesFromPullRequests);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPreviewRelease(getReleasePreview, slackDummy, repos);

      previewRelease((err) => {
        should.not.exist(err);
        const expectedMsg = {
          attachments: [ {
            text: 'Monorail will not deploy anything in the next 10 minutes as there are deployNotes.',
            color: 'danger',
            title: 'socialbro',
            title_link: 'https://github.com/AudienseCo/socialbro'
          } ]
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
      const getReleasePreview = createGetReleasePreview(pullRequestsFromChanges, deployInfoFromPullRequests, issuesFromPullRequests);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPreviewRelease(getReleasePreview, slackDummy, repos);

      previewRelease((err) => {
        should.not.exist(err);
        const expectedMsg = {
          attachments: [ {
            text: 'Monorail will not deploy anything in the next 10 minutes because the list of services is empty.',
            color: 'warning',
            title: 'socialbro',
            title_link: 'https://github.com/AudienseCo/socialbro'
          } ]
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
      const getReleasePreview = createGetReleasePreview(pullRequestsFromChanges, deployInfoFromPullRequests, issuesFromPullRequests);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPreviewRelease(getReleasePreview, slackDummy, repos);

      previewRelease((err) => {
        should.not.exist(err);
        const expectedMsg = {
          attachments: [ {
            text: '*Pull Requests*: <https://github.com/AudienseCo/socialbro/issues/1234|#1234>\n\n*Node version*: v0.10.24\n*Services*: tasks\n\n\n*Issues*:\n<https://github.com/AudienseCo/socialbro/issues/4321|#4321> Bar issue\n\n',
            color: 'good',
            title: 'socialbro',
            title_link: 'https://github.com/AudienseCo/socialbro'
          } ]
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
