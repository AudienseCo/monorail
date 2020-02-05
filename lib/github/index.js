const { Octokit } = require("@octokit/rest");
const createGithub = require('./github');
const { token, user, repo } = require('../../config').github;

const githubApi = new Octokit({
  type: 'oauth',
  token
});

const github = createGithub(githubApi, {
  user,
  repo
});

module.exports = github;
