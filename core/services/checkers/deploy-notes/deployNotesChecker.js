'use strict';

module.exports = function(github) {
  const that = {};

  that.checkPullRequest = (prInfo, cb) => {
    github.getIssueLabels(prInfo.number, (err, labels) => {
      if (err) return cb(err);

      const hasDeployNotes = labels.some(label => label.name.toLowerCase() === 'deploy notes');

      if (hasDeployNotes) {
        cb(null, {
          state: 'failure',
          context: 'Deploy Notes'
        });
      }
      else cb(null, {
        state: 'success',
        context: 'Deploy Notes'
      });
    });
  };

  return that;
};
