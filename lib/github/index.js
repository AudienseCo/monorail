const githubApi    = require('github');
const createGithub = require('./github');

const github = createGithub(githubApi, {
  version: '3.0.0',
  type: 'oauth',
  token: process.env.GH_TOKEN,
  user: 'AudienseCo',
  repo: 'socialbro'
});

module.exports = github;
