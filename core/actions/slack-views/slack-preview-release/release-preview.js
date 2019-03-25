'use strict';

const { user } = require('../../../../config').github;

module.exports = ({ repo, prIds, issues, services }) => {

  const formatedPRs = prIds.map(prId => {
    return `<https://github.com/${user}/${repo}/issues/${prId}|#${prId}>`;
  }).join('\n');

  const formatedIssues = issues.map(issue => {
    return `<https://github.com/${user}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title}`;
  }).join('\n');

  const formatedServices = services.reduce((res, service) => {
    res += `*Node version*: ${service.nodeVersion}\n*Services*: ${service.deploy.join(', ')}\n`;
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
