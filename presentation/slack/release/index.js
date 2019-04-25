'use strict';

const { get } = require('lodash') ;
const ERROR_TEMPLATES = require('./errors');
const releaseMsg = require('./release');

module.exports = (config) => {
  return (releaseInfo, filterLabels) => {
    const user = get(config, 'github.user');
    const githubToSlakUsernames = get(config, 'slack.githubUsers');

    // TODO: add a config setting to notify only if there are filterred issues
    const attachments = releaseInfo.reduce((acc, repoInfo) => {
      if (isFailedReleaseAndFilteredChannel(repoInfo.failReason, filterLabels)) return acc;
      const attachment = repoInfo.failReason
        ? ERROR_TEMPLATES[repoInfo.failReason] || ERROR_TEMPLATES.UNkNOWN_ERROR
        : releaseMsg(repoInfo, filterLabels, user, githubToSlakUsernames);
      if (attachment) {
        attachment.title = repoInfo.repo;
        attachment.title_link = `https://github.com/${user}/${repoInfo.repo}`;
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

  function isFailedReleaseAndFilteredChannel(failReason, filterLabels) {
    return failReason && filterLabels && filterLabels.length > 0;
  }
};
