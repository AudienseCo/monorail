'use strict';

const { mapSeries, waterfall } = require('async');
const { get } = require('lodash');
const logger = require('../../lib/logger');

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
        if (err) {
          logger.error('Error pull requests from changes', repoInfo.repo, err);
          return nextRepo(null, Object.assign({}, repoInfo, { failReason: 'PRS_RETRIEVING_FAILURE' }));
        }
        nextRepo(null, Object.assign({}, repoInfo, { prIds }));
      });
    }, cb);
  }

  function getDeployInfoForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      if (repoInfo.failReason) return nextRepo(null, repoInfo);
      if (repoInfo.prIds.length === 0) {
        return nextRepo(null, Object.assign({}, repoInfo, { failReason: 'NO_CHANGES' }));
      }
      const repoConfig = get(repoInfo, 'config.deploy');
      deployInfoFromPullRequests(repoInfo.repo, repoInfo.prIds, repoConfig, (err, deployInfo) => {
        let failReason;
        if (err) {
          logger.error('Error getting deploy info form PRs', repoInfo.repo, err);
          failReason = err.message;
        }
        else if (deployInfo.deployNotes) {
          failReason = 'DEPLOY_NOTES';
        }
        else if (deployInfo.jobs.length === 0) {
          failReason = 'NO_SERVICES';
        }
        nextRepo(null, Object.assign({}, repoInfo, { failReason, deployInfo }));
      });
    }, cb);
  }

  function getIssuesToReleaseForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      issueReleaseInfoList.get(repoInfo.repo, repoInfo.prIds, (err, issuesInfo) => {
        if (err) {
          logger.error('Error getting issues to release', repoInfo.repo, err);
          return nextRepo(null, Object.assign({}, repoInfo, { failReason: 'ISSUES_RETRIEVING_FAILURE' }));
        }
        const issuesReleaseInfo = issuesInfo.map(issueInfo => ({
          number: issueInfo.issue.number,
          title: issueInfo.issue.title,
          labels: issueInfo.issue.labels.map(label => label.name),
          participants: issueInfo.participants
        }));
        nextRepo(null, Object.assign({}, repoInfo, { issues: issuesReleaseInfo }));
      });
    }, cb);
  }

};
