'use strict';

const { reduce, waterfall } = require('async');
const channel = 'monorail-tests';
const organization = 'AudienseCo';
const repo = 'socialbro';

module.exports = function createPreviewRelease(pullRequestsFromChanges, issuesFromPullRequests, deployInfoFromPullRequests, slack) {

  return function previewRelease(cb) {
    waterfall([
      next => pullRequestsFromChanges(next),
      (pullRequestList, next) => {
        if (pullRequestList.length === 0) return next(new Error('NO_CHANGES'));
        deployInfoFromPullRequests(pullRequestList, (err, deployInfo) => {
          if (deployInfo.deployNotes) return next(new Error('DEPLOY_NOTES'), deployInfo);
          if (deployInfo.services.length === 0) return next(new Error('NO_SERVICES'), deployInfo);
          next(err, pullRequestList, deployInfo);
        });
      },
      (pullRequestList, deployInfo, next) => {
        issuesFromPullRequests(pullRequestList, (err, issues) => {
          next(err, pullRequestList, issues, deployInfo);
        });
      }
    ], (err, pullRequestList, issues, deployInfo) => {
      const msg = err
        ? getErrorMessage(err, deployInfo)
        : getSuccessMessage(pullRequestList, issues, deployInfo);
      slack.send(msg, cb);
    });
  };

  function getErrorMessage(err, deployInfo) {
    let text;
    switch (err.message) {
      case 'NO_CHANGES':
        text = 'Monorail will not deploy anything in the next 10 minutes as there are no changes to deploy.';
        break;
      case 'DEPLOY_NOTES':
        text = 'Monorail will not deploy anything in the next 10 minutes as there are deployNotes.';
        break;
      case 'NO_SERVICES':
        text = 'Monorail will not deploy anything in the next 10 minutes because the list of services is empty.';
        break;
      default:
        'Unhandled error. Monorail will not deploy anything in the next 10 minutes.'
    }
    const pretext = deployInfo ? deployInfo.services.join(', ') : '';
    return {
      channel,
      attachments: [
        {
          pretext,
          text
        }
      ]
    };
  }

  function getSuccessMessage(pullRequestList, issues, deployInfo) {
    const changes = pullRequestList.join(', ');
    const services = formatServices(deployInfo);
    const formatedIssues = issues.map(issue => {
      return `<https://github.com/${organization}/${repo}/issues/${issue.number}|#${issue.number}> ${issue.title}`;
    });
    const text = `Pull Requests: ${changes}\n\n${services}\n\nIssues:\n${formatedIssues}\n\nTo stop this deploy, please insert a deploy_note or <$JENKINS_DEPLOY_URL/job/$TARBALLS_JOB/|disable the deploy job> in Jenkins`;
    return {
      channel,
      attachments: [
        {
          pretext: 'PRs, services and issues that would be deployed with the next release in 10 minutes...',
          text
        }
      ]
    }
  };

  function formatServices(deployInfo) {
    return deployInfo.services.reduce((res, service) => {
      res += `Node version: ${service.nodeVersion}\nServices: ${service.deploy.join(', ')}\n`;
      return res;
    }, '');
  }

};
