'use scrict';

require('should');
const createReleaseNotesTemplate = require('../../../presentation/github/releaseNotes');
const releaseNotesTemplate = createReleaseNotesTemplate({ github: { user: 'AudienseCo' } });

describe('Github Release Notes Template', () => {

  it('should generate release notes correctly', () => {
    const repoInfo = {
      repo: 'repo1',
      prIds: ['10', '20', '30'],
      tag: 'v2011-10-05T14:48:00.000Z',
      issues: [{
        number: '1',
        title: 'issue title 1',
        participants: ['username1', 'username2'],
        labels: []
      },{
        number: '2',
        title: 'issue title 2',
        participants: ['username3'],
        labels: []
      }],
      deployInfo: {
        jobs: [{
          name: 'nodejs v10',
          deployTo: [
            'dashboard',
            'tasks',
            { "name": "rollbackeable service", "rollback": true }
          ],
          params: {
            grunt: true,
            statics: false
          }
        }]
      }
    };
    const body = releaseNotesTemplate(repoInfo);
    const expected =
`## Tag: v2011-10-05T14:48:00.000Z

### Deploy job: nodejs v10
**Services**: dashboard, tasks, rollbackeable service
**Params**:
grunt: true
statics: false

### Pull Requests
#10, #20, #30

### Issues
#1 issue title 1 @username1, @username2
#2 issue title 2 @username3
`;
    body.should.be.eql(expected);
  });
});
