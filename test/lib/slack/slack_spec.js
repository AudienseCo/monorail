'use strict';

require('should');
const sinon = require('sinon');
const createSlack = require('../../../lib/slack/slack');

describe('Slack API wrapper', () => {

  function createIncomingWebhookDummy(err, result) {
    function IncomingWebhook() {
    }
    IncomingWebhook.prototype.send = (msg, cb) => {
      cb(err, result);
    }
    return new IncomingWebhook();
  }

  context('Interface', () => {
    const incomingWebhookDummy = createIncomingWebhookDummy(null, {});
    const slack = createSlack(incomingWebhookDummy);
    it('should have the "send" method', () => {
      slack.send.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should get the labels for a specified issue', done => {
      const incomingWebhookDummy = createIncomingWebhookDummy(null, {});
      const slack = createSlack(incomingWebhookDummy);
      const spy = sinon.spy(incomingWebhookDummy, 'send');

      const channel = 'channel';
      const pretext = 'pre';
      const text = 'hello world';
      const msg = {
        attachments: [{ pretext, text }]
      };
      slack.send(channel, msg, (err, res) => {
        const expectedMsg = {
          channel,
          attachments: [ {
            pretext,
            text
          }]
        };
        spy.calledWith(expectedMsg).should.be.ok();
        done();
      });
    });
  });
});
