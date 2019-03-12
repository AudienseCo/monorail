const { user, repo } = require('../../config').github;

module.exports = ({ pullRequestList, deployInfo, issues }) => {

  const changes = pullRequestList.join(', ');

  const formatedIssues = issues.map(issue => {
    return `<https://github.com/${user}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title}`;
  });

  const formatedServices = deployInfo.services.reduce((res, service) => {
    res += `Node version: ${service.nodeVersion}\nServices: ${service.deploy.join(', ')}\n`;
    return res;
  }, '');

  return {
    pretext: 'PRs, services and issues that would be deployed with the next release in 10 minutes...',
    text:
`Pull Requests: ${changes}

${formatedServices}

Issues:
${formatedIssues}

To stop this deploy, please insert a deploy_note or <$JENKINS_DEPLOY_URL/job/$TARBALLS_JOB/|disable the deploy job> in Jenkins`
  };
};
