'use strict';

const CONFIG_FILE_PATH = '.monorail';

module.exports = (github) => {
  return (repo, cb) => {
    github.getContent(repo, CONFIG_FILE_PATH, (err, contentInfo) => {
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
