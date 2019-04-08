'use strict';

const { mapSeries, waterfall } = require('async');
const { get } = require('lodash');

module.exports = (
  pullRequestsFromChanges,
  deployInfoFromPullRequests,
  issueReleaseInfoList
) => {
  return (reposInfo, cb) => {
    waterfall([
      (next)            => getPRsFromChangesForEachRepo(reposInfo, next),
      (reposInfo, next) => getDeployInfoForEachRepo(reposInfo, next),
      (reposInfo, next) => getIssuesToReleaseForEachRepo(reposInfo, next)
    ], cb);
  };

  function getPRsFromChangesForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      pullRequestsFromChanges({ repo: repoInfo.repo, head: repoInfo.branch }, (err, prIds) => {
        nextRepo(err, Object.assign({ prIds }, repoInfo));
      });
    }, cb);
  }

  function getDeployInfoForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      if (repoInfo.prIds.length === 0) {
        return nextRepo(null, Object.assign({ failReason: 'NO_CHANGES' }, repoInfo));
      }
      const repoConfig = get(repoInfo, 'config.deploy');
      deployInfoFromPullRequests(repoInfo.repo, repoInfo.prIds, repoConfig, (err, deployInfo) => {
        let failReason;
        if (err) {
          failReason = err.message;
        }
        else if (deployInfo.deployNotes) {
          failReason = 'DEPLOY_NOTES';
        }
        else if (deployInfo.jobs.length === 0) {
          failReason = 'NO_SERVICES';
        }
        nextRepo(null, Object.assign({ failReason, deployInfo }, repoInfo));
      });
    }, cb);
  }

  function getIssuesToReleaseForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      issueReleaseInfoList.get(repoInfo.repo, repoInfo.prIds, (err, issuesInfo) => {
        if (err) {
          return nextRepo(null, Object.assign({ failReason: err.message }, repoInfo));
        }
        const issuesReleaseInfo = issuesInfo.map(issueInfo => ({
          number: issueInfo.issue.number,
          title: issueInfo.issue.title,
          labels: issueInfo.issue.labels.map(label => label.name),
          participants: issueInfo.participants
        }));
        nextRepo(null, Object.assign({ issues: issuesReleaseInfo }, repoInfo));
      });
    }, cb);
  }

};
