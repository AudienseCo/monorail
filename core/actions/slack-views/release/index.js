'use strict';

const ERROR_TEMPLATES = require('../errors');
const releaseMsg = require('./release');
const { user } = require('../../../../config').github;

module.exports = (releaseInfo) => {

  const attachments = releaseInfo.map(repoInfo => {
    const attachment = repoInfo.failReason
      ? ERROR_TEMPLATES[repoInfo.failReason] || ERROR_TEMPLATES.UNkNOWN_ERROR
      : releaseMsg(repoInfo);

    attachment.title = repoInfo.repo;
    attachment.title_link = `https://github.com/${user}/${repoInfo.repo}`;
    return attachment;
  });

  return {
    attachments
  };
};
