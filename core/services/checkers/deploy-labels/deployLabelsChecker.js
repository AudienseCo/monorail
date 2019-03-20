'use strict';

module.exports = function(github) {
  const that = {};

  that.checkPullRequest = (repo, prInfo, cb) => {
    github.getIssueLabels(repo, prInfo.number, (err, labels) => {
      if (err) return cb(err);

      const hasdDeployLabels = labels.some(label => label.name.toLowerCase().match(/^deploy-to:/));

      if (!hasdDeployLabels) {
        cb(null, {
          state: 'failure',
          context: 'Deploy Labels'
        });
      }
      else cb(null, {
        state: 'success',
        context: 'Deploy Labels'
      });
    });
  };

  return that;
};
