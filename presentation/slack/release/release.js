'use strict';

const { get, intersection } = require('lodash') ;

module.exports = ({ repo, tag, issues }, filterLabels, user, githubToSlakUsernames) => {

  const formatParticipant = (participant) => {
    const slackUsername = get(githubToSlakUsernames, participant, participant);
    return `<@${slackUsername}>`;
  };

  const formatedIssues = issues.reduce((acc, issue) => {
    if (intersection(issue.labels, filterLabels).length === filterLabels.length) {
      const formatedParticipants = issue.participants.map(formatParticipant).join(', ');
      acc.push(`<https://github.com/${user}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title} ${formatedParticipants}`);
    }
    return acc;
  }, []).join('\n');

  const text =
`*<https://github.com/${user}/${repo}/releases/tag/${tag}|${tag} Release>*

${formatedIssues}

`;
  return {
    text,
    color: 'good'
  };
};
