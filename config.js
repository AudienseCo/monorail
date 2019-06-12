'use strict';

module.exports = {
  github: {
    user: process.env.GH_USER || 'AudienseCo',
    repos: [],
    token: process.env.GH_TOKEN,
    masterBranch: 'master',
    devBranch: 'dev'
  },
  slack: {
    channel: 'monorail-tests',
    webhookUrl: process.env.SLACK_URL || ''
  },
  logger: {
    level: 'error'
  }
};
