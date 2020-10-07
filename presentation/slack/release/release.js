'use strict';

const { get, intersection } = require('lodash') ;

module.exports = ({ repo, tag, issues, deployInfo }, filterLabels, user, githubToSlakUsernames) => {

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

  if (!formatedIssues) return;

  const rollbackJobs = deployInfo.jobs.reduce((acc, job) => {
    const deployJobs = job.deployTo
      .filter(deployJob => deployJob.rollback)
      .map(deployJob => deployJob.name);
    return acc.concat(deployJobs);
  }, []);
  const rollbackCommand = rollbackJobs.length > 0
    ? `\nRollback: \`!monorail rollback on ${rollbackJobs.join(' ')}\``
    : '';

  const text =
`*<https://github.com/${user}/${repo}/releases/tag/${tag}|Release ${tag}>*

${formatedIssues}
${rollbackCommand}
`;
  return {
    text,
    color: 'good'
  };
};
