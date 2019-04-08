'use strict';

const { get } = require('lodash') ;
const ERROR_TEMPLATES = require('./errors');
const releasePreviewMsg = require('./release-preview');

// TODO: clean-up a bit an solve some duplications with release template
module.exports = module.exports = (config) => {
  return (releasePreview, filterLabels) => {
    const user = get(config, 'github.user');

    const attachments = releasePreview.reduce((acc, repoPreview) => {
      const attachment = repoPreview.failReason
        ? ERROR_TEMPLATES[repoPreview.failReason] || ERROR_TEMPLATES.UNkNOWN_ERROR
        : releasePreviewMsg(repoPreview, filterLabels, user);
      if (attachment) {
        attachment.title = repoPreview.repo;
        attachment.title_link = `https://github.com/${user}/${repoPreview.repo}`;
        acc.push(attachment);
      }
      return acc;
    }, []);

    if (attachments.length > 0) {
      return {
        attachments
      };
    }
  };
};
