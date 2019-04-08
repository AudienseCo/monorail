'use strict';

const { get } = require('lodash') ;

module.exports = ({ repo, tag, issues }, user, githubToSlakUsernames) => {

  const formatParticipant = (participant) => {
    const slackUsername = get(githubToSlakUsernames, participant, participant);
    return `@${slackUsername}`;
  };

  const formatedIssues = issues.map(issue => {
    const formatedParticipants = issue.participants.map(formatParticipant).join(', ');
    return `<https://github.com/${user}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title} ${formatedParticipants}`;
  }).join('\n');

  const text =
`*<https://github.com/${user}/${repo}/releases/tag/${tag}|${tag} Release>*

${formatedIssues}

`;
  return {
    text,
    color: 'good'
  };
};
