'use strict';

const { get } = require('lodash') ;
const ERROR_TEMPLATES = require('./errors');
const releaseMsg = require('./release');

module.exports = (config) => {
  return (releaseInfo) => {
    const user = get(config, 'github.user');
    const githubToSlakUsernames = get(config, 'slack.github_users');

    const attachments = releaseInfo.map(repoInfo => {
      const attachment = repoInfo.failReason
        ? ERROR_TEMPLATES[repoInfo.failReason] || ERROR_TEMPLATES.UNkNOWN_ERROR
        : releaseMsg(repoInfo, user, githubToSlakUsernames);

      attachment.title = repoInfo.repo;
      attachment.title_link = `https://github.com/${user}/${repoInfo.repo}`;
      return attachment;
    });

    return {
      attachments
    };
  };
};
