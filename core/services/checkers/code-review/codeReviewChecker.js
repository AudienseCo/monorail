'use strict';

module.exports = function(github) {
  let that = {};

  that.checkPullRequest = (prInfo, cb) => {
    github.getIssueLabels(prInfo.number, (err, labels) => {
      if (err) return cb(err);

      const hasQAReview = labels.some(label => label.name.toLowerCase() === 'review-done:code');

      if (!hasQAReview) {
        cb(null, {
          state: 'failure',
          context: 'Code Review'
        });
      }
      else cb(null, {
        state: 'success',
        context: 'Code Review'
      });
    });
  };

  return that;
};
