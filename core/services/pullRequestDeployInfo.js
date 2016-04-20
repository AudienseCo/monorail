'use strict';

module.exports = function createPullRequestDeployInfo(github) {
  var that = {};

  that.get = (prId, cb) => {
    const deployNotesTag = 'deploy notes';
    const deployTagRegex = /^deploy-to:(.+)/;

    github.getIssueLabels(prId, (err, labels) => {
      cb(null, {
        deployNotes: labels.some(label => {
          return label.name.toLowerCase() === deployNotesTag;
        }),

        services:
          labels.filter(label => {
            return label.name.match(deployTagRegex);
          })
          .map(label => {
            return label.name.match(deployTagRegex)[1];
          })
      });
    });
  };

  return that;
};
