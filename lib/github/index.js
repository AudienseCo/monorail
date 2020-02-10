const { Octokit } = require("@octokit/rest");
const createGithub = require('./github');
const { token, user, repo } = require('../../config').github;

const githubApi = new Octokit({
  auth: token
});

const github = createGithub(githubApi, {
  owner: user,
  repo
});

module.exports = github;
