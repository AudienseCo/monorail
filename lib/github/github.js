'use strict';

module.exports = function(githubApi, config) {
  var that = {};

  githubApi.authenticate({
    type: config.type,
    token: config.token
  });

  that.getIssueLabels = (issue, cb) => {
    githubApi.issues.getIssueLabels(buildMsg({number: issue}), (err, labels) => {
      cb(err, labels);
    });
  };

  that.updateCommitStatus = (options, cb) => {
    const msg = buildMsg(options);
    githubApi.statuses.create(msg, cb);
  };

  that.getPullRequest = (issue, cb) => {
    const msg = buildMsg({ number: issue });
    githubApi.pullRequests.get(msg, cb);
  };

  function buildMsg(options) {
    const defaults = {
      user: config.user,
      repo: config.repo
    };
    return Object.assign({}, defaults, options);
  }

  return that;
};
