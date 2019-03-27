'use scrict';

const should = require('should');
const createReleaseInfoLabel = require('../../../core/services/releaseInfoLabel');
const createReleaseNotesFormatter = require('../../../core/services/releaseNotesFormatter');
const createReleaseService = require('../../../core/services/releaseService');
const createMergeDeployBranch = require('../../../core/services/mergeDeployBranch');
const createDeploy = require('../../../core/services/deploy');

describe('deploy service', () => {
  it('foo', (done) => {
    const githubDummy = createGithubDummy();
    const mergeDeployBranch = createMergeDeployBranch(githubDummy);
    const releaseInfoLabel = createReleaseInfoLabel(githubDummy);
    const releaseNotesFormatter = createReleaseNotesFormatter();
    const releaseService = createReleaseService(githubDummy);
    const getReleaseTag = () => '1.5';
    const deploy = createDeploy(getReleaseTag, mergeDeployBranch, releaseInfoLabel, releaseNotesFormatter, releaseService);

    const repoInfo = {
      repo: '123',
      issues: [{
        number: '456',
        title: 'title',
        labels: [],
        participants: ['user1']
      }]
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
