'use strict';

module.exports = function(github) {
  return {
    create: (tag, releaseInfo, cb) => {
      const data = {
        tag_name: tag,
        name: tag + ' Release',
        body: releaseInfo.map(info => {
          return compose(info);
        }).join('\n')
      };

      github.createRelease(data, err => {
        cb(err, data);
      });
    }
  };
};

function compose(releaseIssueInfo) {
  const issue = releaseIssueInfo.issue;
  const participants = releaseIssueInfo.participants.join(', ');

  return '#' + issue.number + ' ' + issue.title +
    (participants.length ? '. cc ' + participants : '');
}
