'use strict';

const should = require('should');
const sinon = require('sinon');

const createPullRequestsFromChanges = require('../../../core/services/pullRequestsFromChanges');
const createPullRequestDeployInfo = require('../../../core/services/pullRequestDeployInfo');
const createDeployInfoFromPullRequests = require('../../../core/services/deployInfoFromPullRequests');
const createIssueParticipants = require('../../../core/services/issueParticipants');
const createBoundIssueExtractor = require('../../../core/services/boundIssueExtractor');
const createIssueReleaseInfo = require('../../../core/services/issueReleaseInfo');
const createIssueReleaseInfoList = require('../../../core/services/issueReleaseInfoList');
const createGetReleasePreview = require('../../../core/services/getReleasePreview');
const repoConfig = require('../../fixtures/repoConfig.json');

describe('getReleasePreview service', () => {
  const branchesConfig = { masterBranch: '', devBranch: '' };

  it('should get PRs from changes comparing each repo tmp branch with master', (done) => {
    const githubDummy = createGithubDummy();
    const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy, branchesConfig);
    const pullRequestsFromChangesSpy = sinon.spy(pullRequestsFromChanges);
    const getReleasePreview = createGetReleasePreviewStubs({ github: githubDummy, pullRequestsFromChanges: pullRequestsFromChangesSpy });

    const repos = [
      {repo: 'repo1', branch: 'branch1', config: getRepoConfig() },
      {repo: 'repo2', branch: 'branch2', config: getRepoConfig() }
    ];
    getReleasePreview(repos, (err) => {
      should.not.exist(err);
      pullRequestsFromChangesSpy.calledTwice.should.be.ok();
      pullRequestsFromChangesSpy.getCall(0).calledWith({ repo: 'repo1', head: 'branch1' }).should.be.ok();
      pullRequestsFromChangesSpy.getCall(1).calledWith({ repo: 'repo2', head: 'branch2' }).should.be.ok();
      done();
    });
  });

  it('should get deploy info for each repo', (done) => {
    const githubDummy = createGithubDummy();
    const pullRequestDeployInfo = createPullRequestDeployInfo(githubDummy);
    const config = createConfigDummy();
    const deployInfoFromPullRequests = createDeployInfoFromPullRequests(pullRequestDeployInfo, config);
    const deployInfoFromPullRequestsSpy = sinon.spy(deployInfoFromPullRequests);
    const getReleasePreview = createGetReleasePreviewStubs({ github: githubDummy, deployInfoFromPullRequests: deployInfoFromPullRequestsSpy });

    const repos = [
      {repo: 'repo1', branch: 'branch1', config: getRepoConfig() },
      {repo: 'repo2', branch: 'branch2', config: getRepoConfig() }
    ];
    getReleasePreview(repos, (err) => {
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
    const getReleasePreview = createGetReleasePreviewStubs({ github: githubDummy, issueReleaseInfoList });

    const repos = [
      {repo: 'repo1', branch: 'branch1', config: getRepoConfig() },
      {repo: 'repo2', branch: 'branch2', config: getRepoConfig() }
    ];
    getReleasePreview(repos, (err) => {
      should.not.exist(err);
      issueReleaseInfoListSpy.calledTwice.should.be.ok();
      issueReleaseInfoListSpy.getCall(0).calledWith('repo1', [ '890' ]).should.be.ok();
      issueReleaseInfoListSpy.getCall(1).calledWith('repo2', [ '890' ]).should.be.ok();
      done();
    });
  });


  it('should fail with NO_CHANGES when there are no changes', (done) => {
    const githubDummy = createGithubDummy();
    const compareCommitsStub = sinon.stub(githubDummy, 'compareCommits');
    compareCommitsStub.onFirstCall().callsArgWith(1, null, { commits: [] });
    compareCommitsStub.onSecondCall().callsArgWith(1, null, { commits: [] });
    const getReleasePreview = createGetReleasePreviewStubs({ github: githubDummy });

    const repos = [
      {repo: 'repo1', branch: 'branch1', config: getRepoConfig() },
      {repo: 'repo2', branch: 'branch2', config: getRepoConfig() }
    ];
    getReleasePreview(repos, (err, reposInfo) => {
      should.not.exist(err);
      should.exist(reposInfo);
      reposInfo.length.should.be.eql(2);
      reposInfo[0].repo.should.be.eql('repo1');
      reposInfo[0].failReason.should.be.eql('NO_CHANGES');
      done();
    });
  });

  it('should fail with DEPLOY_NOTES when there is an issue with deploy notes label', (done) => {
    const githubDummy = createGithubDummy();
    const getIssueLabelsStub = sinon.stub(githubDummy, 'getIssueLabels');
    getIssueLabelsStub.onFirstCall().callsArgWith(2, null, [{ name: 'deploy notes' }]);
    getIssueLabelsStub.onSecondCall().callsArgWith(2, null, [{ name: 'deploy notes' }]);
    const getReleasePreview = createGetReleasePreviewStubs({ github: githubDummy });

    const repos = [
      {repo: 'repo1', branch: 'branch1', config: getRepoConfig() },
      {repo: 'repo2', branch: 'branch2', config: getRepoConfig() }
    ];
    getReleasePreview(repos, (err, reposInfo) => {
      should.not.exist(err);
      should.exist(reposInfo);
      reposInfo.length.should.be.eql(2);
      reposInfo[0].repo.should.be.eql('repo1');
      reposInfo[0].failReason.should.be.eql('DEPLOY_NOTES');
      done();
    });
  });

  it('should fail with NO_SERVICES when there are no services to deploy', (done) => {
    const githubDummy = createGithubDummy();
    const getIssueLabelsStub = sinon.stub(githubDummy, 'getIssueLabels');
    getIssueLabelsStub.onFirstCall().callsArgWith(2, null, []);
    getIssueLabelsStub.onSecondCall().callsArgWith(2, null, []);
    const getReleasePreview = createGetReleasePreviewStubs({ github: githubDummy });

    const repos = [
      {repo: 'repo1', branch: 'branch1', config: getRepoConfig() },
      {repo: 'repo2', branch: 'branch2', config: getRepoConfig() }
    ];
    getReleasePreview(repos, (err, reposInfo) => {
      should.not.exist(err);
      should.exist(reposInfo);
      reposInfo.length.should.be.eql(2);
      reposInfo[0].repo.should.be.eql('repo1');
      reposInfo[0].failReason.should.be.eql('NO_SERVICES');
      done();
    });
  });

  it('should get the release preview info for each repo', (done) => {
    const getReleasePreview = createGetReleasePreviewStubs({});
    const repos = [
      {repo: 'repo1', branch: 'branch1', config: getRepoConfig() },
      {repo: 'repo2', branch: 'branch2', config: getRepoConfig() }
    ];
    getReleasePreview(repos, (err, reposInfo) => {
      should.not.exist(err);
      should.exist(reposInfo);
      reposInfo.length.should.be.eql(2);
      reposInfo[0].repo.should.be.eql('repo1');
      should.not.exist(reposInfo[0].failReason);
      reposInfo[0].prIds.should.be.eql(['890']);
      reposInfo[0].issues.should.be.eql([{
        number: 4321,
        title: 'Bar issue',
        labels: [],
        participants: ['']
      }]);
      reposInfo[0].deployInfo.jobs.should.be.eql([
        {
          name: 'nodejs v8.6.0',
          deployTo: [
            { "name": "rollbackeable service", "rollback": true },
            'task-as'
          ],
          params: {}
        }
      ]);
      done();
    });
  });

  function getRepoConfig() {
    return repoConfig;
  }

  function createConfigDummy() {
    return {};
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
      getIssueLabels: (repo, id, cb) => cb(err, [
        { name: 'deploy-to:rollbackeable-service'},
        { name: 'deploy-to:task-as' }
      ]),
      getPullRequest: (repo, id, cb) => cb(err, { title: 'Foo PR', body: 'Closes #4321' }),
      getIssue: (repo, id, cb) => {
        cb(err, {
          number: 4321,
          title: 'Bar issue',
          body: '',
          labels: [],
          user: { login: '' }
        });
      },
      getIssueComments: (repo, id, cb) => cb(err, [])
    };
  }

  function createGetReleasePreviewStubs({
    pullRequestsFromChanges,
    pullRequestDeployInfo,
    deployInfoFromPullRequests,
    issueReleaseInfo,
    issueReleaseInfoList,
    github,
    config
  }) {
    const githubDummy = github || createGithubDummy();
    const pullRequestsFromChangesStub = pullRequestsFromChanges || createPullRequestsFromChanges(githubDummy, branchesConfig);
    const pullRequestDeployInfoStub = pullRequestDeployInfo || createPullRequestDeployInfo(githubDummy);
    const configDummy = config || createConfigDummy();
    const deployInfoFromPullRequestsStub = deployInfoFromPullRequests || createDeployInfoFromPullRequests(pullRequestDeployInfoStub);
    const issueParticipants = createIssueParticipants(githubDummy, configDummy);
    const issueReleaseInfoStub = issueReleaseInfo || createIssueReleaseInfo(githubDummy, createBoundIssueExtractor(), issueParticipants);
    const issueReleaseInfoListStub = issueReleaseInfoList || createIssueReleaseInfoList(issueReleaseInfoStub);

    return createGetReleasePreview(
      pullRequestsFromChangesStub,
      deployInfoFromPullRequestsStub,
      issueReleaseInfoListStub
    );
  }

});

