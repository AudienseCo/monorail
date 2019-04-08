'use strict';

const { user } = require('../../../../config').github;

module.exports = ({ repo, prIds, issues, deployInfo }) => {

  const formatedPRs = prIds.map(prId => {
    return `<https://github.com/${user}/${repo}/issues/${prId}|#${prId}>`;
  }).join('\n');

  const formatedIssues = issues.map(issue => {
    const formatedParticipants = issue.participants.map(p => `@${p}`).join(', ');
    return `<https://github.com/${user}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title} ${formatedParticipants}`;
  }).join('\n');

  const formatedServices = deployInfo.jobs.reduce((res, job) => {
    res += `*${job.name}*: ${job.deployTo.join(', ')}\n`;
    return res;
  }, '');

  const text = `*Pull Requests*: ${formatedPRs}

${formatedServices}

*Issues*:
${formatedIssues}

`;
  return {
    text,
    color: 'good'
  };
};
