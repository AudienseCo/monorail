'use strict';

const CONFIG_FILE_PATH = '.monorail';

module.exports = (github) => {
  return (repo, cb) => {
    github.getContent(repo, CONFIG_FILE_PATH, (err, contentInfo) => {
      console.log('contentInfo', err, contentInfo)
      if (err) return cb(err);
      parseContent(contentInfo, cb);
    });
  };

  function parseContent(contentInfo, cb) {
    try {
      const content = new Buffer(contentInfo.content, 'base64').toString('utf8');
      cb(null, JSON.parse(content));
    }
    catch(e) {
      cb(new Error('Invalid config file'));
    }
  }
};
