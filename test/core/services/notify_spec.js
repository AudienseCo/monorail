'use scrict';

const should = require('should');
const sinon = require('sinon');
const createNotify = require('../../../core/services/notify');

describe('notify service', () => {

  it('should trigger an error for non existing notification names', (done) => {
    const notify = createNotifyWithStub({});

    const reposInfo = [];
    const notificationName = 'non existing name';
    const verbose = true;
    notify(reposInfo, notificationName, verbose, (err) => {
      should.exist(err);
      err.message.should.be.eql(`No template defined for this notification name: ${notificationName}`);
      done();
    });
  });

  it('should trigger an error for non existing notification names', (done) => {
    const notify = createNotifyWithStub({ config: {} });

    const reposInfo = [];
    const notificationName = 'preview';
    const verbose = true;
    notify(reposInfo, notificationName, verbose, (err) => {
      should.exist(err);
      err.message.should.be.eql(`There are no settings for this notification name: ${notificationName}`);
      done();
    });
  });

  it('should notify to all configured channels', (done) => {
    const slackDummy = createSlackDummy();
    const slackSpy = sinon.spy(slackDummy, 'send');
    const notify = createNotifyWithStub({ slack: slackDummy });

    const reposInfo = [];
    const notificationName = 'preview';
    const verbose = true;
    notify(reposInfo, notificationName, verbose, (err) => {
      should.not.exist(err);
      slackSpy.calledTwice.should.be.ok();
      slackSpy.firstCall.args[0].should.be.eql('preview-channel1');
      slackSpy.secondCall.args[0].should.be.eql('preview-channel2');
      done();
    });
  });

  it('should not notify if the msg is empty', (done) => {
    const slackDummy = createSlackDummy();
    const slackSpy = sinon.spy(slackDummy, 'send');
    const templatesDummy = {
      preview: sinon.stub()
    };
    templatesDummy.preview.onFirstCall().returns(null);
    templatesDummy.preview.onSecondCall().returns({});
    const notify = createNotifyWithStub({ slack: slackDummy, templates: templatesDummy });

    const reposInfo = [];
    const notificationName = 'preview';
    const verbose = true;
    notify(reposInfo, notificationName, verbose, (err) => {
      should.not.exist(err);
      slackSpy.calledOnce.should.be.ok();
      slackSpy.firstCall.args[0].should.be.eql('preview-channel2');
      done();
    });
  });

  function createConfigDummy() {
    return {
      slack: {
        notifications: {
          preview: [{
            channel: 'preview-channel1',
            labels: []
          },
          {
            channel: 'preview-channel2',
            labels: []
          }],
          release: [{
            channel: 'release-channel1',
            labels: []
          },
          {
            channel: 'release-channel2',
            labels: []
          }]
        }
      }
    };
  }

  function createSlackDummy() {
    return {
      send: (channel, msg, cb) => {
        cb(null, {});
      }
    };
  }

  function createNotifyWithStub({
    config,
    slack,
    templates
  }) {
    const configDummy = config || createConfigDummy();
    const templatesStub = templates || {
      preview: () => ({})
    };
    const slackStub = slack || createSlackDummy();
    return createNotify(templatesStub, slackStub, configDummy);
  }
});
