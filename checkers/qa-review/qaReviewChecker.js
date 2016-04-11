'use strict';

module.exports = function(github) {
  let that = {};

  that.checkPullRequest = (prInfo, cb) => {
    github.getIssueLabels(prInfo.number, (err, labels) => {
      if (err) return cb(err);

      const hasDeployNotes = labels.some(label => label.name.toLowerCase() === 'review-done:qa');

      if (hasDeployNotes) {
        cb(null, {
          state: 'failure',
          context: 'QA Review'
        });
      }
      else cb(null, {
        state: 'success',
        context: 'QA Review'
      });
    });
  };

  return that;
};
