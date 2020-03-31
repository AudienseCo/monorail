'use strict';
const { callbackify } = require('util');

module.exports = function(githubApi, config) {
  const that = {};

  that.getIssueLabels = (repo, issue, cb) => {
    callbackify(githubApi.issues.listLabelsOnIssue)(buildMsg({ issue_number: issue, repo }), (err, res) => handleResponse(err, res.data, cb));
  };

  that.addIssueLabels = (repo, issue, labels, cb) => {
    const msg = buildMsg({ issue_number: issue, labels: labels, repo });
    callbackify(githubApi.issues.update)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.updateCommitStatus = (options, cb) => {
    const msg = buildMsg(options);
    callbackify(githubApi.repos.createStatus)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.getCommitStatus = (repo, sha, cb) => {
    const msg = buildMsg({ repo, sha });
    githubApi.statuses.getCombined(msg, cb);
  };

  that.getPullRequest = (repo, issue, cb) => {
    const msg = buildMsg({ pull_number: issue, repo });
    callbackify(githubApi.pulls.get)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.getIssue = (repo, issue, cb) => {
    const msg = buildMsg({ issue_number: issue, repo });
    callbackify(githubApi.issues.get)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.getIssueComments = (repo, issue, cb) => {
    const info = { issue_number: issue, per_page: 100, repo };
    const msg = Object.assign({}, buildMsg(info));
    callbackify(githubApi.issues.listComments)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.createRelease = (info, cb) => {
    const msg = Object.assign({}, buildMsg(info));
    callbackify(githubApi.repos.createRelease)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.compareCommits = (info, cb) => {
    const msg = Object.assign({}, buildMsg(info));
    callbackify(githubApi.repos.compareCommits)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.getBranch = (repo, branch, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref: `heads/${branch}` }));
    callbackify(githubApi.git.getRef)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.createBranch = (repo, branch, sha, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref: `refs/heads/${branch}`, sha }));
    callbackify(githubApi.git.createRef)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.removeBranch = (repo, branch, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref: `heads/${branch}` }));
    callbackify(githubApi.git.deleteRef)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.removeTag = (repo, tag, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref: `tags/${tag}` }));
    callbackify(githubApi.git.deleteRef)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.merge = (repo, base, head, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, base, head }));
    callbackify(githubApi.repos.merge)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.getContent = (repo, path, ref, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, path, ref }));
    callbackify(githubApi.repos.getContents)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.getProtectedBranchRequiredStatusChecks = (repo, branch, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, branch }));
    callbackify(githubApi.repos.getProtectedBranchRequiredStatusChecks)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  that.getChecksForRef = (repo, ref, cb) => {
    const msg = Object.assign({}, buildMsg({ repo, ref }));
    callbackify(githubApi.checks.listForRef)(msg, (err, res) => handleResponse(err, res.data, cb));
  };

  function buildMsg(options) {
    const defaults = {
      owner: config.owner,
      repo: config.repo
    };
    return Object.assign({}, defaults, options);
  }

  function handleResponse(err, res, cb) {
    cb(err, res && res.data ? res.data : res);
  }

  return that;
};
