'use strict';
const { get } = require('lodash');
const logger = require('../../lib/logger');
const CONFIG_FILE_PATH = '.monorail';

module.exports = (github, localConfig) => {
  return (repo, cb) => {
    const devBranch = get(localConfig, 'github.devBranch');
    github.getContent(repo, CONFIG_FILE_PATH, devBranch, (err, contentInfo) => {
      if (err) return cb(err);
      const content = parseContent(contentInfo);
      if (content) cb(null, content)
      else cb(new Error('Invalid config file'));
    });
  };

  function parseContent(contentInfo) {
    try {
      const content = new Buffer(contentInfo.content, 'base64').toString('utf8');
      return JSON.parse(content);
    }
    catch(e) {
      logger.error(`Error parsing ${CONFIG_FILE_PATH} file, invalid JSON.`, e);
      return;
    }
  }
};
