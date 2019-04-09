'use strict';

const { series } = require('async');
const { get } = require('lodash');

module.exports = (getReleaseTag, build, mergeDeployBranch, releaseInfoLabel, releaseNotesTemplate, releaseService) => {
  return (repoInfo, cb) => {

    const masterBranch = get(repoInfo, 'config.github.masterBranch');
    const devBranch = get(repoInfo, 'config.github.devBranch');
    const deployedLabel = get(repoInfo, 'config.github.deployedLabel');
    const tag = getReleaseTag();

    // TODO: map to avoid breaking changes, we can refactor it once removed the old actions
    const releaseInfoList = repoInfo.issues.map(issue => {
      return {
        issue,
        participants: issue.participants
      };
    });

    series([
      (next) => build(repoInfo.branch, repoInfo.deployInfo.jobs, repoInfo.config.deploy, next),
      (next) => mergeDeployBranch(repoInfo.repo, masterBranch, devBranch, repoInfo.branch, next),
      (next) => {
        if (!deployedLabel) return next();
        releaseInfoLabel.addLabels(repoInfo.repo, releaseInfoList, [deployedLabel], next);
      },
      (next) => {
        const body = releaseNotesTemplate(repoInfo);
        releaseService.create(repoInfo.repo, tag, body, next);
      }
    ], (err) => cb(err, Object.assign({ tag }, repoInfo)));
  };
}
