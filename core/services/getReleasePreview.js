'use strict';

const { mapSeries, waterfall } = require('async');

module.exports = (
  pullRequestsFromChanges,
  deployInfoFromPullRequests,
  issuesFromPullRequests
) => {
  return (reposBranches, cb) => {
    waterfall([
      (next)            => getPRsFromChangesForEachRepo(reposBranches, next),
      (reposInfo, next) => getDeployInfoForEachRepo(reposInfo, next),
      (reposInfo, next) => getIssuesToReleaseForEachRepo(reposInfo, next)
    ], cb);
  };

  function getPRsFromChangesForEachRepo(reposBranches, cb) {
    mapSeries(reposBranches, (repoBranch, nextRepo) => {
      pullRequestsFromChanges(repoBranch, (err, prIds) => {
        nextRepo(err, { repo: repoBranch.repo, prIds, branch: repoBranch.head });
      });
    }, cb);
  }

  function getDeployInfoForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      if (repoInfo.prIds.length === 0) {
        return nextRepo(null, Object.assign({ failReason: 'NO_CHANGES' }, repoInfo));
      }
      deployInfoFromPullRequests(repoInfo.repo, repoInfo.prIds, (err, deployInfo) => {
        let failReason;
        if (err) {
          failReason = err.message;
        }
        else if (deployInfo.deployNotes) {
          failReason = 'DEPLOY_NOTES';
        }
        else if (deployInfo.services.length === 0) {
          failReason = 'NO_SERVICES';
        }
        nextRepo(null, Object.assign({ failReason, services: deployInfo.services }, repoInfo));
      });
    }, cb);
  }

  function getIssuesToReleaseForEachRepo(reposInfo, cb) {
    mapSeries(reposInfo, (repoInfo, nextRepo) => {
      issuesFromPullRequests(repoInfo.repo, repoInfo.prIds, (err, issues) => {
        if (err) {
          return nextRepo(null, Object.assign({ failReason: err.message }, repoInfo));
        }
        nextRepo(null, Object.assign({ issues }, repoInfo));
      });
    }, cb);
  }

};
