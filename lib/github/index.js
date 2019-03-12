const GithubApi    = require('github');
const createGithub = require('./github');
const { token, user, repo } = require('../../config').github;

const githubApi = new GithubApi({
  version: '3.0.0'
});

const github = createGithub(githubApi, {
  type: 'oauth',
  token,
  user,
  repo
});

module.exports = github;
