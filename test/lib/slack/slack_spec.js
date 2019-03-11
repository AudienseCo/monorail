'use strict';

require('should');
const sinon = require('sinon');
const createSlack = require('../../../lib/slack/slack');

describe('Slack API wrapper', () => {

  function createIncomingWebhookDummy(err, result) {
    function IncomingWebhook(url) {
    }
    IncomingWebhook.prototype.send = (text, cb) => cb(err, result);
    return IncomingWebhook;
  }

  context('Interface', () => {
    const IncomingWebhookDummy = createIncomingWebhookDummy(null, {});
    const webhookUrl = '';
    const slack = createSlack(IncomingWebhookDummy, webhookUrl);
    it('should have the "getIssueLabels" method', () => {
      slack.send.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should get the labels for a specified issue', done => {
      const IncomingWebhookDummy = createIncomingWebhookDummy(null, {});
      const webhookUrl = '';
      const slack = createSlack(IncomingWebhookDummy, webhookUrl);
      const spy = sinon.spy(slack, 'send');
      const text = 'hello world';
      slack.send(text, (err, res) => {
        spy.calledWith(text).should.be.ok();
        done();
      });
    });

  });
});
