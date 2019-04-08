'use strict';

const ERROR_TEMPLATES = require('./errors');
const releasePreviewMsg = require('./release-preview');

module.exports = module.exports = (config) => {
  return (releasePreview) => {
    const { user } = config.github;
    const attachments = releasePreview.map(repoPreview => {
      const attachment = repoPreview.failReason
        ? ERROR_TEMPLATES[repoPreview.failReason] || ERROR_TEMPLATES.UNkNOWN_ERROR
        : releasePreviewMsg(repoPreview, user);

      attachment.title = repoPreview.repo;
      attachment.title_link = `https://github.com/${user}/${repoPreview.repo}`;
      return attachment;
    });

    return {
      attachments
    };
  };
};
