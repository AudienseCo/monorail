'use strict';

module.exports = function createPullRequestDeployInfo(github) {
  const that = {};

  that.get = (repo, prId, cb) => {
    const deployNotesTag = 'deploy notes';
    const deployTagRegex = /^deploy-to:(.+)/;

    github.getIssueLabels(repo, prId, (err, labels) => {
      if (err) return cb(err);

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
