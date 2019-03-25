'use strict';

const ERROR_TEMPLATES = require('./errors');
const releasePreviewMsg = require('./release-preview');
const { user } = require('../../../../config').github;

module.exports = (releasePreview) => {

  const attachments = releasePreview.map(repoPreview => {
    const attachment = repoPreview.failReason
      ? ERROR_TEMPLATES[repoPreview.failReason] || ERROR_TEMPLATES.UNkNOWN_ERROR
      : releasePreviewMsg(repoPreview);

    attachment.title = repoPreview.repo;
    attachment.title_link = `https://github.com/${user}/${repoPreview.repo}`;
    return attachment;
  });

  return {
    attachments
  };
};
