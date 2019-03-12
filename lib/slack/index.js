'use strict';

const { IncomingWebhook } = require('@slack/client');
const createSlackClient = require('./slack');
const { channel } = require('../../config');
const webhookUrl = process.env.SLACK_URL || '';
const incomingWebhook = new IncomingWebhook(webhookUrl);
module.exports = createSlackClient(incomingWebhook, { channel });
