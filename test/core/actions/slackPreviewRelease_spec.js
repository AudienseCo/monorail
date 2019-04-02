'use strict';

const should = require('should');
const sinon = require('sinon');

const createIssueParticipants = require('../../../core/services/issueParticipants');
const createBoundIssueExtractor = require('../../../core/services/boundIssueExtractor');
const createIssueReleaseInfo = require('../../../core/services/issueReleaseInfo');
const createIssueReleaseInfoList = require('../../../core/services/issueReleaseInfoList');
const createPreviewRelease = require('../../../core/actions/slackPreviewRelease');
const createPullRequestsFromChanges = require('../../../core/services/pullRequestsFromChanges');
const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createDeployInfoFromPullRequests = require('../../../core/services/deployInfoFromPullRequests');
const createGetReleasePreview = require('../../../core/services/getReleasePreview');
const createGetRepoConfig = require('../../../core/services/getRepoConfig');

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
      const prInfo = {};
      const issueInfo = {};
      const commitsInfo = {
        commits: []
      };
      const githubDummy = createGithubDummy(prInfo, issueInfo, commitsInfo);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPrevieReleaseWithStubs({ github: githubDummy, slack: slackDummy });


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
      const githubDummy = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      stub.onFirstCall().callsArgWith(2, null, [{ name: 'deploy notes' }]);
      stub.onSecondCall().callsArgWith(2, null, [{ name: 'deploy-to:globalreports' }]);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPrevieReleaseWithStubs({ github: githubDummy, slack: slackDummy });

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
      const githubDummy = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      stub.onFirstCall().callsArgWith(2, null, []);
      stub.onSecondCall().callsArgWith(2, null, []);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPrevieReleaseWithStubs({ github: githubDummy, slack: slackDummy });

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
      const githubDummy = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      stub.onFirstCall().callsArgWith(2, null, [{ name: 'deploy-to:tasks-as' }]);
      stub.onSecondCall().callsArgWith(2, null, [{ name: 'deploy-to:globalreports' }]);
      const slackDummy = createSlackDummy();
      const slackSpy = sinon.spy(slackDummy, 'send');
      const previewRelease = createPrevieReleaseWithStubs({ github: githubDummy, slack: slackDummy });

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

    function createConfigDummy() {
      const servicesMap = {
        globalreports: {
          'nodeVersion': 'v0.10.24',
          statics: true,
          deploy: ['globalreports']
        },
        'tasks-as': {
          'nodeVersion': 'v0.10.24',
          statics: true,
          deploy: ['tasks']
        }
      };
      return {
        services: {
          mapper: service => {
            return servicesMap[service];
          }
        }
      };
    }


    function createGithubDummy(prInfo, issueInfo, commitsInfo, labelsInfo) {
      return {
        getPullRequest: (repo, id, cb) => {
          cb(null, prInfo) || { title: 'Foo PR', body: 'Closes #4321' };
        },
        getIssue: (repo, id, cb) => {
          const defaultIssueInfo = { number: 4321, title: 'Bar issue', body: '', user: { login: '' } };
          cb(null, issueInfo || defaultIssueInfo);
        },
        compareCommits: (info, cb) => {
          const defaultCommitsInfo = {
            commits: [
              {
                commit: {
                  message: 'Merge pull request #1234'
                }
              }
            ]
          };
          cb(null, commitsInfo || defaultCommitsInfo);
        },
        getIssueLabels: (repo, id, cb) => {
          cb(null, labelsInfo);
        },
        getIssueComments: (repo, id, cb) => cb(null, []),
        getContent: (repo, path, cb) => cb(null, { content: 'eyAidGV4dCI6ICJoZWxsbyBiYXNlNjQgZW5jb2RlZCB3b3JsZCIgfQ==' })
      };

    }

    function createSlackDummy() {
      return {
        send: (msg, cb) => {
          cb(null, {});
        }
      };
    }

    function createPrevieReleaseWithStubs({
      getRepoConfig,
      pullRequestsFromChanges,
      pullRequestDeployInfo,
      deployInfoFromPullRequests,
      issueReleaseInfo,
      issueReleaseInfoList,
      getReleasePreview,
      slack,
      github
    }) {
      const githubDummy = github || createGithubDummy();
      const configDummy = createConfigDummy();
      const getRepoConfigStub = getRepoConfig || createGetRepoConfig(githubDummy);
      const pullRequestsFromChangesStub = pullRequestsFromChanges || createPullRequestsFromChanges(githubDummy, {});
      const pullRequestDeployInfoStub = pullRequestDeployInfo || createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequestsStub = deployInfoFromPullRequests || createDeployInfoFromPullRequests(pullRequestDeployInfoStub, configDummy);
      const issueParticipants = createIssueParticipants(githubDummy, configDummy);
      const issueReleaseInfoStub = issueReleaseInfo || createIssueReleaseInfo(githubDummy, createBoundIssueExtractor(), issueParticipants);
      const issueReleaseInfoListStub = issueReleaseInfoList || createIssueReleaseInfoList(issueReleaseInfoStub);
      const getReleasePreviewStub = getReleasePreview || createGetReleasePreview(pullRequestsFromChangesStub, deployInfoFromPullRequestsStub, issueReleaseInfoListStub);
      const slackDummy = slack || createSlackDummy();

      return createPreviewRelease(getRepoConfigStub, getReleasePreviewStub, slackDummy, repos);
    }


  });
});
