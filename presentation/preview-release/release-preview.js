'use strict';

module.exports = ({ repo, prIds, issues, deployInfo }, user) => {

  const formatedPRs = prIds.map(prId => {
    return `<https://github.com/${user}/${repo}/issues/${prId}|#${prId}>`;
  }).join('\n');

  const formatedIssues = issues.map(issue => {
    return `<https://github.com/${user}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title}`;
  }).join('\n');

  const formatedServices = deployInfo.jobs.reduce((res, job) => {
    res += `*${job.name}*: ${job.deployTo.join(', ')}\n`;
    return res;
  }, '');

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
