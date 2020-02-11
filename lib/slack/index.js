'use strict';

const { IncomingWebhook } = require('@slack/webhook');
const createSlackClient = require('./slack');
const { webhookUrl } = require('../../config').slack;
const incomingWebhook = new IncomingWebhook(webhookUrl, {});
module.exports = createSlackClient(incomingWebhook);
