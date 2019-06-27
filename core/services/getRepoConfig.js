'use strict';
const { get } = require('lodash');
const CONFIG_FILE_PATH = '.monorail';

module.exports = (github, localConfig) => {
  return (repo, cb) => {
    const masterBranch = get(localConfig, 'config.github.masterBranch');
    github.getContent(repo, CONFIG_FILE_PATH, masterBranch, (err, contentInfo) => {
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
      return;
    }
  }
};
