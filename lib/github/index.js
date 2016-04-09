const GithubApi    = require('github');
const createGithub = require('./github');

const githubApi = new GithubApi({
  version: '3.0.0'
});

const github = createGithub(githubApi, {
  type: 'oauth',
  token: process.env.GH_TOKEN,
  user: 'AudienseCo',
  repo: 'socialbro'
});

module.exports = github;
