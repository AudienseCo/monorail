'use strict'

module.exports = function(github) {
  return {
    create: (tag, issues, cb) => {
      const releaseInfo = {
        tag_name: tag,
        name: tag + ' Release',
        body: issues.map(issue => { return '#' + issue.number + ' ' + issue.title; }).join('\n')
      };
      github.createRelease(releaseInfo, cb);
    }
  };
}