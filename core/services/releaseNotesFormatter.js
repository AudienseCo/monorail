'use strict';

module.exports = function releaseNotesFormatter() {

  function compose(releaseIssueInfo) {
    const issue = releaseIssueInfo.issue;
    const participants = releaseIssueInfo.participants.join(', ');

    return '#' + issue.number + ' ' + issue.title +
      (participants.length ? '. cc ' + participants : '');
  }

  return {
    format: (releaseInfoList) => {
      return releaseInfoList.map(compose).join('\n');
    }
  };
};
