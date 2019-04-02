'use strict';

const should = require('should');
const sinon = require('sinon');

const createPullRequestsFromChanges = require('../../../core/services/pullRequestsFromChanges');
const createCreateDeployTemporaryBranch = require('../../../core/services/createDeployTemporaryBranch');
const createGetRepoConfig = require('../../../core/services/getRepoConfig');
const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createDeployInfoFromPullRequests = require('../../../core/services/deployInfoFromPullRequests');
const createIssueParticipants = require('../../../core/services/issueParticipants');
const createBoundIssueExtractor = require('../../../core/services/boundIssueExtractor');
const createIssueReleaseInfo = require('../../../core/services/issueReleaseInfo');
const createIssueReleaseInfoList = require('../../../core/services/issueReleaseInfoList');
const createGetReleasePreview = require('../../../core/services/getReleasePreview');
const createReleaseInfoLabel = require('../../../core/services/releaseInfoLabel');
const createReleaseNotesFormatter = require('../../../core/services/releaseNotesFormatter');
const createReleaseService = require('../../../core/services/releaseService');
const createMergeDeployBranch = require('../../../core/services/mergeDeployBranch');
const createDeploy = require('../../../core/services/deploy');
const createCleanUpDeploy = require('../../../core/services/cleanUpDeploy');
const createStartDeploy = require('../../../core/actions/startDeploy');

describe('start deploy action', () => {
  const branchesConfig = { masterBranch: '', devBranch: '' };
  const clock = {
    now: () => 123
  };

  it('should get the config file from each repo', (done) => {
    const githubDummy = createGithubDummy();
    const getRepoConfig = createGetRepoConfig(githubDummy);
    const getRepoConfigSpy = sinon.spy(getRepoConfig);
    const startDeploy = createStartDeployWithStubs({ github: githubDummy, getRepoConfig: getRepoConfigSpy });

    const repos = ['repo1', 'repo2'];
    const showPreview = false;
    startDeploy(repos, showPreview, (err) => {
      should.not.exist(err);
      getRepoConfigSpy.calledTwice.should.be.ok();
      getRepoConfigSpy.getCall(0).calledWith('repo1').should.be.ok();
      getRepoConfigSpy.getCall(1).calledWith('repo2').should.be.ok();
      done();
    });
  });

  it('should create a temporary branch per repo', (done) => {
    const githubDummy = createGithubDummy();
    const createDeployTemporaryBranch = createCreateDeployTemporaryBranch(githubDummy, clock);
    const createDeployTemporaryBranchSpy = sinon.spy(createDeployTemporaryBranch);
    const startDeploy = createStartDeployWithStubs({ github: githubDummy, createDeployTemporaryBranch: createDeployTemporaryBranchSpy });

    const repos = ['repo1', 'repo2'];
    const showPreview = false;
    startDeploy(repos, showPreview, (err) => {
      should.not.exist(err);
      createDeployTemporaryBranchSpy.calledTwice.should.be.ok();
      createDeployTemporaryBranchSpy.getCall(0).calledWith('repo1').should.be.ok();
      createDeployTemporaryBranchSpy.getCall(1).calledWith('repo2').should.be.ok();
      done();
    });
  });

  it('should get PRs from changes comparing each repo tmp branch with master', (done) => {
    const githubDummy = createGithubDummy();
    const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy, branchesConfig);
    const pullRequestsFromChangesSpy = sinon.spy(pullRequestsFromChanges);
    const startDeploy = createStartDeployWithStubs({ github: githubDummy, pullRequestsFromChanges: pullRequestsFromChangesSpy });

    const repos = ['repo1', 'repo2'];
    const showPreview = false;
    startDeploy(repos, showPreview, (err) => {
      should.not.exist(err);
      pullRequestsFromChangesSpy.calledTwice.should.be.ok();
      pullRequestsFromChangesSpy.getCall(0).calledWith({ repo: 'repo1', head: 'deploy-123' }).should.be.ok();
      pullRequestsFromChangesSpy.getCall(1).calledWith({ repo: 'repo2', head: 'deploy-123' }).should.be.ok();
      done();
    });
  });

  it('should get deploy info for each repo', (done) => {
    const githubDummy = createGithubDummy();
    const pullRequestDeployInfo = createPullRequestDeployInfo(githubDummy);
    const config = createConfigDummy();
    const deployInfoFromPullRequests = createDeployInfoFromPullRequests(pullRequestDeployInfo, config);
    const deployInfoFromPullRequestsSpy = sinon.spy(deployInfoFromPullRequests);
    const startDeploy = createStartDeployWithStubs({ github: githubDummy, deployInfoFromPullRequests: deployInfoFromPullRequestsSpy });

    const repos = ['repo1', 'repo2'];
    const showPreview = false;
    startDeploy(repos, showPreview, (err) => {
      should.not.exist(err);
      deployInfoFromPullRequestsSpy.calledTwice.should.be.ok();
      deployInfoFromPullRequestsSpy.getCall(0).calledWith('repo1', [ '890' ]).should.be.ok();
      deployInfoFromPullRequestsSpy.getCall(1).calledWith('repo2', [ '890' ]).should.be.ok();
      done();
    });
  });

  it('should get issues to release for each repo', (done) => {
    const githubDummy = createGithubDummy();
    const configDummy = createConfigDummy();
    const issueParticipants = createIssueParticipants(githubDummy, configDummy);
    const issueReleaseInfo = createIssueReleaseInfo(githubDummy, createBoundIssueExtractor(), issueParticipants);
    const issueReleaseInfoList = createIssueReleaseInfoList(issueReleaseInfo);
    const issueReleaseInfoListSpy = sinon.spy(issueReleaseInfoList, 'get');
    const startDeploy = createStartDeployWithStubs({ github: githubDummy, issueReleaseInfoList });

    const repos = ['repo1', 'repo2'];
    const showPreview = false;
    startDeploy(repos, showPreview, (err) => {
      should.not.exist(err);
      issueReleaseInfoListSpy.calledTwice.should.be.ok();
      issueReleaseInfoListSpy.getCall(0).calledWith('repo1', [ '890' ]).should.be.ok();
      issueReleaseInfoListSpy.getCall(1).calledWith('repo2', [ '890' ]).should.be.ok();
      done();
    });
  });

  it('should not send a preview to slack if param showPreview is false', (done) => {
    const slackDummy = createSlackDummy();
    const slackSpy = sinon.spy(slackDummy, 'send');
    const startDeploy = createStartDeployWithStubs({ slack: slackDummy });

    const repos = ['repo1', 'repo2'];
    const showPreview = false;
    startDeploy(repos, showPreview, (err) => {
      should.not.exist(err);
      slackSpy.calledOnce.should.be.ok();
      done();
    });
  });


  it('should send a preview to slack if param showPreview is true', (done) => {
    const slackDummy = createSlackDummy();
    const slackSpy = sinon.spy(slackDummy, 'send');
    const startDeploy = createStartDeployWithStubs({ slack: slackDummy });

    const repos = ['repo1', 'repo2'];
    const showPreview = true;
    startDeploy(repos, showPreview, (err) => {
      should.not.exist(err);
      slackSpy.calledTwice.should.be.ok();
      done();
    });
  });


  it('it should clean up branch and tags if the deploy fails', (done) => {
    const githubDummy = createGithubDummy();
    const cleanUpDeploy = createCleanUpDeploy(githubDummy);
    const cleanUpDeploySpy = sinon.spy(cleanUpDeploy);
    const createDeployTemporaryBranch = (repo, devBranch, cb) => cb(new Error('dummy error'));
    const startDeploy = createStartDeployWithStubs({ createDeployTemporaryBranch, cleanUpDeploy: cleanUpDeploySpy });

    const repos = ['repo1', 'repo2'];
    const showPreview = false;
    startDeploy(repos, showPreview, (err) => {
      should.not.exist(err);
      cleanUpDeploySpy.calledOnce.should.be.ok();
      done();
    });
  });

  function createConfigDummy() {
    const servicesMap = {
      globalreports: {
        'node-version': 'v0.10.24',
        statics: true,
        deploy: ['globalreports']
      },
      'tasks-as': {
        'node-version': 'v0.10.24',
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

  function createGithubDummy(err, res) {
    return {
      compareCommits: (compareInfo, cb) => {
        const defaultRes = {
          commits: [{
            commit: { message: 'Merge pull request #890' }
          }]
        };
        cb(err, res || defaultRes);
      },
      getBranch: (repo, branch, cb) => cb(err, { object: { sha: 'abc' } }),
      createBranch: (repo, branch, sha, cb) => cb(err, { name: branch }),
      removeBranch: (repo, branch, cb) => cb(err, res),
      removeTag: (repo, tag, cb) => cb(err, res),
      getIssueLabels: (repo, id, cb) => cb(err, [{ name: 'deploy-to:tasks-as' }]),
      getPullRequest: (repo, id, cb) => cb(err, { title: 'Foo PR', body: 'Closes #4321' }),
      getIssue: (repo, id, cb) => cb(err, { number: 4321, title: 'Bar issue', body: '', user: { login: '' } }),
      getIssueComments: (repo, id, cb) => cb(null, []),
      addIssueLabels: (repo, issueNumber, labels, cb) => cb(err, res),
      createRelease: (info, cb) => {
        const defaultRes = {
          tag_name: info.tag_name
        };
        cb(err, res || defaultRes);
      },
      merge: (repo, base, head, cb) => cb(err, res),
      getContent: (repo, path, cb) => cb(err, res || { content: 'eyAidGV4dCI6ICJoZWxsbyBiYXNlNjQgZW5jb2RlZCB3b3JsZCIgfQ==' })
    };
  }

  function createSlackDummy() {
    return {
      send: (msg, cb) => {
        cb(null, {});
      }
    };
  }

  function createStartDeployWithStubs({
    createDeployTemporaryBranch,
    getRepoConfig,
    pullRequestsFromChanges,
    pullRequestDeployInfo,
    deployInfoFromPullRequests,
    issueReleaseInfo,
    issueReleaseInfoList,
    getReleasePreview,
    deploy,
    cleanUpDeploy,
    slack,
    github
  }) {
    const githubDummy = github || createGithubDummy();
    const getRepoConfigStub = getRepoConfig || createGetRepoConfig(githubDummy);
    const createDeployTemporaryBranchStub = createDeployTemporaryBranch || createCreateDeployTemporaryBranch(githubDummy, clock);
    const pullRequestsFromChangesStub = pullRequestsFromChanges || createPullRequestsFromChanges(githubDummy, branchesConfig);
    const pullRequestDeployInfoStub = pullRequestDeployInfo || createPullRequestDeployInfo(githubDummy);
    const configDummy = createConfigDummy();
    const deployInfoFromPullRequestsStub = deployInfoFromPullRequests || createDeployInfoFromPullRequests(pullRequestDeployInfoStub, configDummy);
    const issueParticipants = createIssueParticipants(githubDummy, configDummy);
    const issueReleaseInfoStub = issueReleaseInfo || createIssueReleaseInfo(githubDummy, createBoundIssueExtractor(), issueParticipants);
    const issueReleaseInfoListStub = issueReleaseInfoList || createIssueReleaseInfoList(issueReleaseInfoStub);
    const getReleasePreviewStub = getReleasePreview || createGetReleasePreview(pullRequestsFromChangesStub, deployInfoFromPullRequestsStub, issueReleaseInfoListStub);
    const mergeDeployBranch = createMergeDeployBranch(githubDummy);
    const releaseInfoLabel = createReleaseInfoLabel(githubDummy);
    const releaseNotesFormatter = createReleaseNotesFormatter();
    const releaseService = createReleaseService(githubDummy);
    const getReleaseTag = () => '';
    const deployStub = deploy || createDeploy(getReleaseTag, mergeDeployBranch, releaseInfoLabel, releaseNotesFormatter, releaseService);
    const cleanUpDeployStub = cleanUpDeploy || createCleanUpDeploy(githubDummy);
    const slackDummy = slack || createSlackDummy();

    return createStartDeploy(
      getRepoConfigStub,
      createDeployTemporaryBranchStub,
      getReleasePreviewStub,
      deployStub,
      cleanUpDeployStub,
      slackDummy
    );
  }

});

