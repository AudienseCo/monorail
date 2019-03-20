'use strict';

const async = require('async');

module.exports = function(github) {
  const that = {};

  that.addLabels = (repo, releaseInfo, labels, cb) => {

    async.eachLimit(releaseInfo, 5, (info, next) => {
      const issue = info.issue;
      const issueLabels = issue.labels || [];
      const currentLabels = issueLabels.map(label => { return label.name; });
      const newLabels = currentLabels.concat(labels);
      github.addIssueLabels(repo, issue.number, newLabels, next);
    }, cb);

  };

  return that;
};
