'use strict';

const { get } = require('lodash') ;
const ERROR_TEMPLATES = require('./errors');
const releasePreviewMsg = require('./release-preview');

module.exports = module.exports = (config) => {
  return (releasePreview, filterLabels) => {
    const user = get(config, 'github.user');

    const attachments = releasePreview.reduce((acc, repoPreview) => {
      if (isFailedReleaseAndFilteredChannel(repoPreview.failReason, filterLabels)) return acc;
      const attachment = repoPreview.failReason
        ? ERROR_TEMPLATES[repoPreview.failReason] || ERROR_TEMPLATES.UNkNOWN_ERROR
        : releasePreviewMsg(repoPreview, filterLabels, user);
      if (attachment) {
        acc.push(Object.assign({}, attachment, {
          title: repoPreview.repo,
          title_link: `https://github.com/${user}/${repoPreview.repo}`
        }));
      }
      return acc;
    }, []);

    if (attachments.length > 0) {
      attachments.unshift({
        text: 'PRs, services and issues that would be deployed with the next release...'
      });
      return {
        attachments
      };
    }
  };

  function isFailedReleaseAndFilteredChannel(failReason, filterLabels) {
    return failReason && filterLabels && filterLabels.length > 0;
  }
};
