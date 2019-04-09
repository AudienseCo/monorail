'use scrict';

require('should');
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
    const msg = releaseTemplate(releaseInfo, filterLabels);
    msg.should.be.eql({
      attachments: [{
        text: 'Monorail will not deploy anything because there is no pull request linked to services to deploy.',
        color: 'warning',
        title: 'repo1',
        title_link: 'https://github.com/AudienseCo/repo1'
      },
      {
        text: 'Monorail will not deploy anything as there is one pull request with deploy notes label added.',
        color: 'danger',
        title: 'repo2',
        title_link: 'https://github.com/AudienseCo/repo2'
      },
      {
        text: 'Monorail will not deploy anything as there are no changes since the last deploy.',
        color: '#439FE0',
        title: 'repo3',
        title_link: 'https://github.com/AudienseCo/repo3'
      },
      {
        text: 'Unhandled error. Monorail will not deploy anything.',
        color: 'danger',
        title: 'repo4',
        title_link: 'https://github.com/AudienseCo/repo4'
      }]
    });
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
          name: 'nodejs v10',
          deployTo: ['dashboard', 'tasks']
        }]
      }
    }];
    const filterLabels = [];
    const msg = releaseTemplate(releaseInfo, filterLabels);
    msg.should.be.eql({
      attachments: [{
        text:
`*<https://github.com/AudienseCo/repo1/releases/tag/123456789|123456789 Release>*

<https://github.com/AudienseCo/repo1/issues/123|#123> issue title <@slack_username1>, <@username2>, <@slack_username3>

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
    const msg = releaseTemplate(releaseInfo, filterLabels);
    msg.should.be.eql({
      attachments: [{
        text:
`*<https://github.com/AudienseCo/repo1/releases/tag/123456789|123456789 Release>*

<https://github.com/AudienseCo/repo1/issues/2|#2> issue title 2 <@slack_username1>, <@username2>, <@slack_username3>

`,
        color: 'good',
        title: 'repo1',
        title_link: 'https://github.com/AudienseCo/repo1'
      }]
    });
  });

});
