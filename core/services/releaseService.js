'use strict';

module.exports = function(github) {
  return {
    create: (tag, body, cb) => {
      const data = {
        tag_name: tag,
        name: tag + ' Release',
        body: body
      };

      github.createRelease(data, err => {
        cb(err, data);
      });
    }
  };
};
