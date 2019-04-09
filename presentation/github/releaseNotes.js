'use strict';

const { map } = require('lodash') ;

module.exports = () => {
  return ({ tag, prIds, deployInfo, issues }) => {

    const formatedPRs = prIds.map(prId => `#${prId}`).join(', ');

    const formatedIssues = issues.map(issue => {
      const participants = issue.participants.map(u => `@${u}`).join(', ');
      return `#${issue.number} ${issue.title} ${participants}`;
    }).join('\n');

    const formatedServices = deployInfo.jobs.map(job => {
      // TODO: combine with default params
      const formatedParams = map(job.params, (value, key) => `${key}: ${value}`).join('\n');
      return [
        `### Deploy job: ${job.name}`,
        `**Services**: ${job.deployTo.join(', ')}`,
        `**Params**:`,
        formatedParams
      ].join('\n');
    }).join('\n');

    const body =
`## Tag: ${tag}

${formatedServices}

### Pull Requests
${formatedPRs}

### Issues
${formatedIssues}
`;
    return body;
  };
};
