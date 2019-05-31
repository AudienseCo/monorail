'use scrict';

require('should');
const createPreviewReleaseTemplate = require('../../../../presentation/slack/preview-release');
const previewReleaseTemplate = createPreviewReleaseTemplate({ github: { user: 'AudienseCo' } });

describe('Preview Release Slack Notification Template', () => {
  it('should generate templates for the same error and different repos correctly', () => {
    const releaseInfo = [{
      repo: 'repo3',
      failReason: 'NO_CHANGES'
    },
    {
      repo: 'repo4',
      failReason: 'NO_CHANGES'
    }];
    const filterLabels = [];
    const msg = previewReleaseTemplate(releaseInfo, filterLabels);
    msg.should.be.eql({
      attachments: [{
        text: 'PRs, services and issues that would be deployed with the next release...'
      },{
        text: 'Monorail will not deploy anything in the next 10 minutes as there have not been changes since the last deploy.',
        color: '#439FE0',
        title: 'repo3',
        title_link: 'https://github.com/AudienseCo/repo3'
      },
      {
        text: 'Monorail will not deploy anything in the next 10 minutes as there have not been changes since the last deploy.',
        color: '#439FE0',
        title: 'repo4',
        title_link: 'https://github.com/AudienseCo/repo4'
      }]
    });
  });

  it('should generate error templates correctly', () => {
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
    const msg = previewReleaseTemplate(releaseInfo, filterLabels);
    msg.should.be.eql({
      attachments: [{
        text: 'PRs, services and issues that would be deployed with the next release...'
      },{
        text: 'Monorail will not deploy anything in the next 10 minutes because there is no pull request linked to services to deploy.',
        color: 'warning',
        title: 'repo1',
        title_link: 'https://github.com/AudienseCo/repo1'
      },
      {
        text: 'Monorail will not deploy anything in the next 10 minutes as there is a pull request with deploy notes label added.',
        color: 'danger',
        title: 'repo2',
        title_link: 'https://github.com/AudienseCo/repo2'
      },
      {
        text: 'Monorail will not deploy anything in the next 10 minutes as there have not been changes since the last deploy.',
        color: '#439FE0',
        title: 'repo3',
        title_link: 'https://github.com/AudienseCo/repo3'
      },
      {
        text: 'Unhandled error. Monorail will not deploy anything in the next 10 minutes.',
        color: 'danger',
        title: 'repo4',
        title_link: 'https://github.com/AudienseCo/repo4'
      }]
    });
  });

  it('should generate release preview template correctly', () => {
    const releaseInfo = [{
      repo: 'repo1',
      prIds: ['10', '20', '30'],
      issues: [{
        number: '123',
        title: 'issue title',
        participants: ['username1', 'username2'],
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
    const msg = previewReleaseTemplate(releaseInfo, filterLabels);
    msg.should.be.eql({
      attachments: [{
        text: 'PRs, services and issues that would be deployed with the next release...'
      },{
        text:
`*Pull Requests*: <https://github.com/AudienseCo/repo1/issues/10|#10>, <https://github.com/AudienseCo/repo1/issues/20|#20>, <https://github.com/AudienseCo/repo1/issues/30|#30>

*nodejs v10*: dashboard, tasks

*Issues*:\n<https://github.com/AudienseCo/repo1/issues/123|#123> issue title

`,
        color: 'good',
        title: 'repo1',
        title_link: 'https://github.com/AudienseCo/repo1'
      }]
    });
  });

  it('should filter issues by label correctly', () => {
    const releaseInfo = [{
      repo: 'repo1',
      prIds: ['10', '20', '30'],
      issues: [{
        number: '1',
        title: 'issue title 1',
        participants: ['username1', 'username2'],
        labels: []
      },{
        number: '2',
        title: 'issue title 2',
        participants: ['username1', 'username2'],
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
    const msg = previewReleaseTemplate(releaseInfo, filterLabels);
    msg.should.be.eql({
      attachments: [{
        text: 'PRs, services and issues that would be deployed with the next release...'
      },{
        text:
`*Pull Requests*: <https://github.com/AudienseCo/repo1/issues/10|#10>, <https://github.com/AudienseCo/repo1/issues/20|#20>, <https://github.com/AudienseCo/repo1/issues/30|#30>

*nodejs v10*: dashboard, tasks

*Issues*:\n<https://github.com/AudienseCo/repo1/issues/2|#2> issue title 2

`,
        color: 'good',
        title: 'repo1',
        title_link: 'https://github.com/AudienseCo/repo1'
      }]
    });
  });

});
