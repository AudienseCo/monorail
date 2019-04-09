'use strict';

const { intersection } = require('lodash');

module.exports = ({ repo, prIds, issues, deployInfo }, filterLabels, user) => {

  const formatedPRs = prIds.map(prId => {
    return `<https://github.com/${user}/${repo}/issues/${prId}|#${prId}>`;
  }).join(', ');

  const formatedIssues = issues.reduce((acc, issue) => {
    if (intersection(issue.labels, filterLabels).length === filterLabels.length) {
      acc.push(`<https://github.com/${user}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title}`);
    }
    return acc;
  }, []).join('\n');
  if (formatedIssues.length === 0) return;

  const formatedServices = deployInfo.jobs.map(job => `*${job.name}*: ${job.deployTo.join(', ')}`).join('\n');

  const text =
  `*Pull Requests*: ${formatedPRs}

${formatedServices}

*Issues*:
${formatedIssues}

`;
  return {
    text,
    color: 'good'
  };
};
