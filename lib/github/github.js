'use strict';

module.exports = function(githubApi, config) {
  const that = {};

  that.getIssueLabels = (repo, issue, cb) => {
    githubApi.issues.getIssueLabels(buildMsg({ number: issue, repo }), (err, labels) => {
      cb(err, labels);
    });
  };

  that.addIssueLabels = (repo, issue, labels, cb) => {
    const msg = buildMsg({ number: issue, labels: labels, repo });
    githubApi.issues.edit(msg, cb);
  };

  that.updateCommitStatus = (options, cb) => {
    const msg = buildMsg(options);
    githubApi.statuses.create(msg, cb);
  };

  that.getPullRequest = (repo, issue, cb) => {
    const msg = buildMsg({ number: issue, repo });
    githubApi.pullRequests.get(msg, cb);
  };

  that.getIssue = (repo, issue, cb) => {
    const msg = buildMsg({ number: issue, repo });
    githubApi.issues.getRepoIssue(msg, cb);
  };

  that.getIssueComments = (repo, issue, cb) => {
    const info = { number: issue, per_page: 100, repo };
    const msg = Object.assign({}, buildMsg(info));
    githubApi.issues.getComments(msg, cb);
  };

  that.createRelease = (info, cb) => {
    const msg = Object.assign({}, buildMsg(info), { owner: config.user });
    githubApi.releases.createRelease(msg, cb);
  };

  that.compareCommits = (info, cb) => {
    const msg = Object.assign({}, buildMsg(info));
    githubApi.repos.compareCommits(msg, cb);
  };

  that.getBranch = (repo, branch, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref: `heads/${branch}` }));
    githubApi.gitdata.getReference(msg, cb);
  };

  that.createBranch = (repo, branch, sha, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref: `refs/heads/${branch}`, sha }));
    githubApi.gitdata.createReference(msg, cb);
  };

  that.removeBranch = (repo, branch, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref: `heads/${branch}` }));
    githubApi.gitdata.deleteReference(msg, cb);
  };

  that.removeTag = (repo, tag, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref: `tags/${tag}` }));
    githubApi.gitdata.deleteReference(msg, cb);
  };

  that.merge = (repo, base, head, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, base, head }));
    githubApi.repos.merge(msg, cb);
  };

  that.getContent = (repo, path, ref, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, path, ref }));
    githubApi.repos.getContents(msg, cb);
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
