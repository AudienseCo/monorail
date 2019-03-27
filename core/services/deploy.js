'use strict';

const { series } = require('async');

module.exports = (getReleaseTag, mergeDeployBranch, releaseInfoLabel, releaseNotesFormatter, releaseService) => {
  return (repoInfo, cb) => {

    // TODO: get it from config
    const masterBranch = 'master';
    const devBranch = 'dev';
    const deployedLabel = 'deployed';
    const tag = getReleaseTag();
    const build = (cb) => cb();

    // TODO: map to avoid breaking changes, we can refactor it once removed the old actions
    const releaseInfoList = repoInfo.issues.map(issue => {
      return {
        issue,
        participants: issue.participants
      };
    });

    series([
      (next) => build(next),
      (next) => mergeDeployBranch(repoInfo.repo, masterBranch, devBranch, repoInfo.branch, next),
      (next) => releaseInfoLabel.addLabels(repoInfo.repo, releaseInfoList, [deployedLabel], next),
      (next) => {
        const body = releaseNotesFormatter.format(releaseInfoList);
        releaseService.create(repoInfo.repo, tag, body, next);
      }
    ], (err) => cb(err, Object.assign({ tag }, repoInfo)));
  };
}
