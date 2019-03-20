'use strict';

const ERROR_TEMPLATES = require('./errors');
const releasePreviewMsg = require('./release-preview');
const { user } = require('../../../../config').github;

module.exports = (releasePreview) => {

  const attachments = releasePreview.map(repoPreview => {
    const attachment = repoPreview.error
      ? errorMessage(repoPreview.error)
      : releasePreviewMsg(repoPreview);

    attachment.title = repoPreview.repo;
    attachment.title_link = `https://github.com/${user}/${repoPreview.repo}`;
    return attachment;
  });

  return {
    attachments
  };

  function errorMessage(error) {
    return ERROR_TEMPLATES[error.message] || ERROR_TEMPLATES.UNkNOWN_ERROR;
  }
};
