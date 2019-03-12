'use strict';

const { user } = require('../../config').github;

module.exports = ({ repo, pullRequestList, issues, deployInfo }) => {

  const changes = pullRequestList.join(', ');
  const formatedIssues = issues.map(issue => {
    return `<https://github.com/${user}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title}\n`;
  });
  const formatedServices = deployInfo.services.reduce((res, service) => {
    res += `Node version: ${service.nodeVersion}\nServices: ${service.deploy.join(', ')}\n`;
    return res;
  }, '');

  const text = `Repository: ${repo}

Pull Requests: ${changes}

${formatedServices}

Issues:
${formatedIssues}


`;
  return text;
};
