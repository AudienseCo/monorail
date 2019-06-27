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
const repoConfig = require('../../fixtures/repoConfig.json');

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
      const notifyStub = createNotifyStub();
      const previewRelease = createPrevieReleaseWithStubs({ github: githubDummy, notify: notifyStub });
      const options = { repos };
      previewRelease(options, (err) => {
        should.not.exist(err);
        const reposInfo = notifyStub.firstCall.args[0];
        reposInfo[0].failReason.should.be.eql('NO_CHANGES');
        done();
      });
    });

    it('should notify a DEPLOY_NOTES error if there is a PR with deploy notes label', done => {
      const githubDummy = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      stub.onFirstCall().callsArgWith(2, null, [{ name: 'deploy notes' }]);
      stub.onSecondCall().callsArgWith(2, null, [{ name: 'deploy-to:globalreports' }]);
      const notifyStub = createNotifyStub();
      const previewRelease = createPrevieReleaseWithStubs({ github: githubDummy, notify: notifyStub });
      const options = { repos };
      previewRelease(options, (err) => {
        should.not.exist(err);
        const reposInfo = notifyStub.firstCall.args[0];
        reposInfo[0].failReason.should.be.eql('DEPLOY_NOTES');
        done();
      });
    });

    it('should notify a NO_SERVICES error if there are no deploy labels added to the PRs', done => {
      const githubDummy = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      stub.onFirstCall().callsArgWith(2, null, []);
      stub.onSecondCall().callsArgWith(2, null, []);
      const notifyStub = createNotifyStub();
      const previewRelease = createPrevieReleaseWithStubs({ github: githubDummy, notify: notifyStub });
      const options = { repos };
      previewRelease(options, (err) => {
        should.not.exist(err);
        const reposInfo = notifyStub.firstCall.args[0];
        reposInfo[0].failReason.should.be.eql('NO_SERVICES');
        done();
      });
    });

    it('should notify the release preview with PRs, issues and deploy info', done => {
      const githubDummy = createGithubDummy();
      const stub = sinon.stub(githubDummy, 'getIssueLabels');
      stub.onFirstCall().callsArgWith(2, null, [{ name: 'deploy-to:task-as' }]);
      stub.onSecondCall().callsArgWith(2, null, [{ name: 'deploy-to:globalreports' }]);
      const notifyStub = createNotifyStub();
      const previewRelease = createPrevieReleaseWithStubs({ github: githubDummy, notify: notifyStub });
      const options = { repos };
      previewRelease(options, (err) => {
        should.not.exist(err);
        const firstRepo = notifyStub.firstCall.args[0][0];
        firstRepo.repo.should.be.eql('socialbro');
        firstRepo.issues.should.be.eql([
          {
            number: 4321,
            title: 'Bar issue',
            participants: [''],
            labels: []
          }
        ]);
        firstRepo.deployInfo.should.be.eql({
          deployNotes: false,
          jobs: [
            {
              name: 'nodejs v8.6.0',
              deployTo: [
                'task-as'
              ],
              params: {}
            }
          ]
        });
        firstRepo.prIds.should.be.eql(['1234']);
        should.exist(firstRepo.config);
        done();
      });
    });

    function createConfigDummy() {
      return {};
    }


    function createGithubDummy(prInfo, issueInfo, commitsInfo, labelsInfo) {
      return {
        getPullRequest: (repo, id, cb) => {
          cb(null, prInfo) || { title: 'Foo PR', body: 'Closes #4321' };
        },
        getIssue: (repo, id, cb) => {
          const defaultIssueInfo = {
            number: 4321,
            title: 'Bar issue',
            body: '',
            labels: [],
            user: { login: '' }
          };
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

    function createGetRepoConfigStub(github) {
      return (repo, cb) => {
        cb(null, repoConfig);
      }
    }

    function createNotifyStub() {
      const notify = (reposInfo, notificationName, verbose, cb) => cb();
      return sinon.spy(notify);
    }

    function createPrevieReleaseWithStubs({
      getRepoConfig,
      pullRequestsFromChanges,
      pullRequestDeployInfo,
      deployInfoFromPullRequests,
      issueReleaseInfo,
      issueReleaseInfoList,
      getReleasePreview,
      notify,
      github
    }) {
      const githubDummy = github || createGithubDummy();
      const configDummy = createConfigDummy();
      const getRepoConfigStub = getRepoConfig || createGetRepoConfigStub(githubDummy);
      const pullRequestsFromChangesStub = pullRequestsFromChanges || createPullRequestsFromChanges(githubDummy, {});
      const pullRequestDeployInfoStub = pullRequestDeployInfo || createPullRequestDeployInfo(githubDummy);
      const deployInfoFromPullRequestsStub = deployInfoFromPullRequests || createDeployInfoFromPullRequests(pullRequestDeployInfoStub);
      const issueParticipants = createIssueParticipants(githubDummy, configDummy);
      const issueReleaseInfoStub = issueReleaseInfo || createIssueReleaseInfo(githubDummy, createBoundIssueExtractor(), issueParticipants);
      const issueReleaseInfoListStub = issueReleaseInfoList || createIssueReleaseInfoList(issueReleaseInfoStub);
      const getReleasePreviewStub = getReleasePreview || createGetReleasePreview(pullRequestsFromChangesStub, deployInfoFromPullRequestsStub, issueReleaseInfoListStub);
      const notifyStub = notify || createNotifyStub();

      return createPreviewRelease(getRepoConfigStub, getReleasePreviewStub, notifyStub);
    }


  });
});
