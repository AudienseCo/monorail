'use strict';

module.exports = function(github) {
  return {
    create: (repo, tag, body, cb) => {
      const data = {
        tag_name: tag,
        name: tag + ' Release',
        body: body,
        repo
      };

      github.createRelease(data, err => {
        cb(err, data);
      });
    }
  };
};
