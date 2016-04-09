'use strict';

module.exports = function(boundIssueExtractor, github) {
  let that = {};

  that.checkPullRequest = (prInfo, cb) => {
    const boundIssue = boundIssueExtractor.extract(prInfo.body);

    if (boundIssue) {
      github.getIssueLabels(boundIssue, (err, labels) => {
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
    }
    else cb(null, {
      state: 'success',
      context: 'Deploy Notes'
    });
  };

  return that;
};
