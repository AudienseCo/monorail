'use scrict';

const should = require('should');
const createReleaseTemplate = require('../../../../presentation/slack/release');

describe('Release Slack Notification Template', () => {

  it('should generate error templates correctly', () => {
    const releaseTemplate = createReleaseTemplate({ github: { user: 'AudienseCo' } });

    const releaseInfo = [{
      repo: 'repo1',
      failReason: 'NO_SERVICES'
    },
    {
      repo: 'repo2',
      failReason: 'DEPLOY_NOTES'
    },
    {
      repo: 'repo3',
      failReason: 'NO_CHANGES'
    },
    {
      repo: 'repo4',
      failReason: 'another error'
    }];
    const filterLabels = [];
    const verbose = true;
    const msg = releaseTemplate(releaseInfo, filterLabels, verbose);
    msg.should.be.eql({
      attachments: [{
        text: 'Monorail didn\'t deploy anything because there is no pull request linked to services to deploy.',
        color: 'warning',
        title: 'repo1',
        title_link: 'https://github.com/AudienseCo/repo1'
      },
      {
        text: 'Monorail didn\'t deploy anything as there is one pull request with deploy notes label added.',
        color: 'danger',
        title: 'repo2',
        title_link: 'https://github.com/AudienseCo/repo2'
      },
      {
        text: 'Monorail didn\'t deploy anything as there are no changes since the last deploy.',
        color: '#439FE0',
        title: 'repo3',
        title_link: 'https://github.com/AudienseCo/repo3'
      },
      {
        text: 'Monorail failed with an unexpected error (another error). Check the monorail logs before deploying again: some services may have been deployed.',
        color: 'danger',
        title: 'repo4',
        title_link: 'https://github.com/AudienseCo/repo4'
      }]
    });
  });

  it('should tell what happened when the deploy fails at each step', () => {
    const releaseTemplate = createReleaseTemplate({ github: { user: 'AudienseCo' } });
    const failed = (failStep) => ({
      repo: 'repo1',
      branch: 'deploy-123',
      failReason: 'REPO_DEPLOY_FAILED',
      failStep,
      failMessage: 'Error merging deploy-123 into master: Merge conflict (HTTP 409)'
    });

    const texts = ['build', 'merge', 'labels', 'release', 'unknown']
      .map(step => releaseTemplate([failed(step)], [], true).attachments[0]);

    texts[0].text.should.startWith('Deploy failed in the CI job.');
    texts[1].text.should.startWith('Services were deployed, but Monorail couldn\'t merge the deploy branch `deploy-123` into master and dev');
    texts[2].text.should.startWith('Services were deployed and merged, but Monorail couldn\'t add the deployed label');
    texts[3].text.should.startWith('Services were deployed and merged, but Monorail couldn\'t create the GitHub release.');
    texts[4].text.should.startWith('Deploy failed. Check the monorail logs');
    texts.forEach(attachment => {
      attachment.text.should.endWith('\n>Error merging deploy-123 into master: Merge conflict (HTTP 409)');
      attachment.title.should.be.eql('repo1');
      attachment.text.should.not.containEql('didn\'t deploy anything');
    });
  });

  it('should truncate long deploy errors', () => {
    const releaseTemplate = createReleaseTemplate({ github: { user: 'AudienseCo' } });
    const msg = releaseTemplate([{ repo: 'repo1', failReason: 'REPO_DEPLOY_FAILED', failStep: 'build', failMessage: 'x'.repeat(1000) }], [], true);
    msg.attachments[0].text.should.endWith(`>${'x'.repeat(500)}…`);
  });

  it('should generate release template correctly', () => {
    const releaseTemplate = createReleaseTemplate({
      github: {
        user: 'AudienseCo'
      },
      slack: {
        githubUsers: {
          'username1': 'slack_username1',
          'username3': 'slack_username3'
        }
      }
    });

    const releaseInfo = [{
      repo: 'repo1',
      tag: '123456789',
      issues: [{
        number: '123',
        title: 'issue title',
        participants: ['username1', 'username2', 'username3'],
        labels: []
      }],
      deployInfo: {
        jobs: [{
          name: 'nodejs v8.6.0',
          deployTo: ['dashboard', 'tasks', { "name": "rollbackeable service", "rollback": true }]
        }]
      }
    }];
    const filterLabels = [];
    const verbose = true;
    const msg = releaseTemplate(releaseInfo, filterLabels, verbose);
    msg.should.be.eql({
      attachments: [{
        text:
`*<https://github.com/AudienseCo/repo1/releases/tag/123456789|Release 123456789>*

<https://github.com/AudienseCo/repo1/issues/123|#123> issue title <@slack_username1>, <@username2>, <@slack_username3>

Rollback: \`!monorail rollback on rollbackeable service\`
`,
        color: 'good',
        title: 'repo1',
        title_link: 'https://github.com/AudienseCo/repo1'
      }]
    });
  });

  it('should filter by labels', () => {
    const releaseTemplate = createReleaseTemplate({
      github: {
        user: 'AudienseCo'
      },
      slack: {
        githubUsers: {
          'username1': 'slack_username1',
          'username3': 'slack_username3'
        }
      }
    });

    const releaseInfo = [{
      repo: 'repo1',
      tag: '123456789',
      issues: [{
        number: '1',
        title: 'issue title 1',
        participants: ['username1', 'username2', 'username3'],
        labels: ['label1']
      },{
        number: '2',
        title: 'issue title 2',
        participants: ['username1', 'username2', 'username3'],
        labels: ['notify-staff']
      }],
      deployInfo: {
        jobs: [{
          name: 'nodejs v10',
          deployTo: ['dashboard', 'tasks']
        }]
      }
    }];
    const filterLabels = ['notify-staff'];
    const verbose = true;
    const msg = releaseTemplate(releaseInfo, filterLabels, verbose);
    msg.should.be.eql({
      attachments: [{
        text:
`*<https://github.com/AudienseCo/repo1/releases/tag/123456789|Release 123456789>*

<https://github.com/AudienseCo/repo1/issues/2|#2> issue title 2 <@slack_username1>, <@username2>, <@slack_username3>

`,
        color: 'good',
        title: 'repo1',
        title_link: 'https://github.com/AudienseCo/repo1'
      }]
    });
  });

  it('should generate empty msg if there are no issues', () => {
    const releaseTemplate = createReleaseTemplate({
      github: {
        user: 'AudienseCo'
      },
      slack: {
        githubUsers: {
          'username1': 'slack_username1',
          'username3': 'slack_username3'
        }
      }
    });

    const releaseInfo = [{
      repo: 'repo1',
      tag: '123456789',
      issues: [{
        number: '1',
        title: 'issue title 1',
        participants: ['username1', 'username2', 'username3'],
        labels: ['label1']
      },{
        number: '2',
        title: 'issue title 2',
        participants: ['username1', 'username2', 'username3'],
        labels: []
      }],
      deployInfo: {
        jobs: [{
          name: 'nodejs v10',
          deployTo: ['dashboard', 'tasks']
        }]
      }
    }];
    const filterLabels = ['notify-staff'];
    const verbose = true;
    const msg = releaseTemplate(releaseInfo, filterLabels, verbose);
    should.not.exist(msg);
  });

  it('should generate empty msg if all releases failed', () => {
    const releaseTemplate = createReleaseTemplate({
      github: {
        user: 'AudienseCo'
      },
      slack: {
        githubUsers: {
          'username1': 'slack_username1',
          'username3': 'slack_username3'
        }
      }
    });

    const releaseInfo = [{
      repo: 'repo1',
      tag: '123456789',
      issues: [{
        number: '1',
        title: 'issue title 1',
        participants: ['username1', 'username2', 'username3'],
        labels: []
      }],
      deployInfo: {
        jobs: [{
          name: 'nodejs v10',
          deployTo: ['dashboard', 'tasks']
        }]
      }
    },{
      repo: 'repo2',
      tag: '123456789',
      failedReason: 'failed',
      issues: []
    }];
    const filterLabels = ['notify-staff'];
    const verbose = true;
    const msg = releaseTemplate(releaseInfo, filterLabels, verbose);
    should.not.exist(msg);
  });

  it('should not generate template if there is nothing to deploy for any repo and verbose is false', () => {
    const releaseTemplate = createReleaseTemplate({ github: { user: 'AudienseCo' } });

    const releaseInfo = [{
      repo: 'repo1',
      failReason: 'NO_CHANGES'
    },
    {
      repo: 'repo2',
      failReason: 'NO_SERVICES'
    },
    {
      repo: 'repo3',
      failReason: 'NO_CHANGES'
    },
    {
      repo: 'repo4',
      failReason: 'NO_CHANGES'
    }];
    const filterLabels = [];
    const verbose = false;
    const msg = releaseTemplate(releaseInfo, filterLabels, verbose);
    should.not.exist(msg);
  });

});
