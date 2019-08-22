'use scrict';

const should = require('should');
const createDeployInProgressTemplate = require('../../../../presentation/slack/deploy-in-progress');
const deploysController = require('../../../../core/services/deploysController')();
const deployInProgressTemplate = createDeployInProgressTemplate({ github: { user: 'AudienseCo' } }, deploysController);

describe('Deploy In Progress Slack Notification Template', () => {
  it('should generate error templates correctly', () => {
    const releaseInfo = [];
    const filterLabels = [];
    const verbose = true;
    const msg = deployInProgressTemplate(releaseInfo, filterLabels, verbose);
    msg.should.be.eql({
      attachments: [
        {
          text: ':no_entry: There is a deploy in progress.',
          color: 'danger'
        }
      ]
    });
  });

  beforeEach(() => deploysController.finish);

});
