'use strict';

module.exports = function(github) {
  const that = {};

  that.checkPullRequest = (prInfo, cb) => {
    github.getIssueLabels(prInfo.repository.name, prInfo.number, (err, labels) => {
      if (err) return cb(err);

      const hasQAReview = labels.some(label => label.name.toLowerCase() === 'review-done:qa');

      if (!hasQAReview) {
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
