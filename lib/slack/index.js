'use strict';

const { IncomingWebhook } = require('@slack/client');
const createSlackClient = require('./slack');
const webhookUrl = process.env.SLACK_URL || '';

module.exports = createSlackClient(IncomingWebhook, webhookUrl);
