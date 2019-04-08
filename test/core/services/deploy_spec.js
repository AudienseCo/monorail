'use scrict';

const should = require('should');
const createReleaseInfoLabel = require('../../../core/services/releaseInfoLabel');
const createReleaseNotesFormatter = require('../../../core/services/releaseNotesFormatter');
const createReleaseService = require('../../../core/services/releaseService');
const createMergeDeployBranch = require('../../../core/services/mergeDeployBranch');
const createBuild = require('../../../core/services/build');
const createDeploy = require('../../../core/services/deploy');
const createCallCIDriver = require('../../../core/services/callCIDriver');
const repoConfig = require('../../fixtures/repoConfig.json');

describe('deploy service', () => {
  it('should deploy', (done) => {
    const githubDummy = createGithubDummy();
    const mergeDeployBranch = createMergeDeployBranch(githubDummy);
    const releaseInfoLabel = createReleaseInfoLabel(githubDummy);
    const releaseNotesFormatter = createReleaseNotesFormatter();
    const releaseService = createReleaseService(githubDummy);
    const ciDrivers = {
      jenkins: (settings, jobName, params, cb) => cb(null, true)
    };
    const callCIDriver = createCallCIDriver(ciDrivers);
    const build = createBuild(callCIDriver);
    const getReleaseTag = () => '1.5';
    const deploy = createDeploy(getReleaseTag, build, mergeDeployBranch, releaseInfoLabel, releaseNotesFormatter, releaseService);

    const repoInfo = {
      repo: '123',
      issues: [{
        number: '456',
        title: 'title',
        labels: [],
        participants: ['user1']
      }],
      deployInfo: {
        deployNotes: false,
        jobs: [
          {
            name: 'nodejs v8.6.0',
            deployTo: ['task-as', 'globalreports-as'],
            params: {}
          },
          {
            name: 'nodejs v10.0.0',
            deployTo: ['dashboard-as', 'task-as'],
            params: {
              grunt: true,
              statics: true
            }
          }
        ]
      },
      config: repoConfig
    };
    deploy(repoInfo, (err, repoInfo) => {
      should.not.exists(err);
      repoInfo.tag.should.be.eql('1.5');
      done();
    });
  });

  function createGithubDummy(err, res) {
    return {
      addIssueLabels: (repo, issueNumber, labels, cb) => cb(err, res),
      createRelease: (info, cb) => cb(err, res),
      merge: (repo, base, head, cb) => cb(err, cb),
      removeBranch: (repo, branch, cb) => cb(err, cb)
    };
  }

});
