'use strict';

const serviceMap = {
  globalreports: {
    deploy: [
      'globalreports-as'
    ],
    nodeVersion: 'v8.6.0',
    grunt: false,
    statics: false
  },
  'admin-panel': {
    deploy: [
      'admin-panel-as'
    ],
    nodeVersion: 'v8.6.0',
    grunt: false,
    statics: false
  },
  node: {}
};

module.exports = {
  github: {
    user: process.env.GH_USER || 'AudienseCo',
    repo: process.env.GH_REPO || 'socialbro',
    repos: ['socialbro'],
    token: process.env.GH_TOKEN,
    masterBranch: 'master',
    devBranch: 'dev'
  },
  services: {
    mapper: service => {
      const serviceKey = service.replace(/\s/g, '-');
      return Object.assign({}, serviceMap[serviceKey] || service);
    },
    reducer: (acc, service) => {
      if (!acc) acc = [];
      if (!service.deploy) return acc;

      const version = service.nodeVersion;
      const existedItem = acc.find(item => {
        return item.nodeVersion === version;
      });
      if (!existedItem) acc.push(service);
      else {
        existedItem.deploy = existedItem.deploy.concat(service.deploy);
        existedItem.statics = existedItem.statics || service.statics;
        existedItem.grunt = existedItem.grunt || service.grunt;
      }
      return acc;
    }
  },
  slack: {
    channel: 'monorail-tests',
    webhookUrl: process.env.SLACK_URL || '',
    users: {
      map: user => {
        const list = {
          'github.username': 'slack_username'
        };
        return '@' + (list[user] || user);
      }
    }
  }
};
