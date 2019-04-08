'use strict';

// TODO: move to presentation layer?

module.exports = function releaseNotesFormatter() {

  function compose(releaseIssueInfo) {
    const issue = releaseIssueInfo.issue;
    const participants = releaseIssueInfo.participants.map(u => `@${u}`).join(', ');

    return '#' + issue.number + ' ' + issue.title +
      (participants.length ? '. cc ' + participants : '');
  }

  return {
    format: (releaseInfoList) => {
      return releaseInfoList.map(compose).join('\n');
    }
  };
};
