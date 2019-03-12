'use strict';

const { IncomingWebhook } = require('@slack/client');
const createSlackClient = require('./slack');
const { channel, webhookUrl } = require('../../config').slack;
const incomingWebhook = new IncomingWebhook(webhookUrl);
module.exports = createSlackClient(incomingWebhook, { channel });
