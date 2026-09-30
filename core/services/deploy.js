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
    const releaseInfoList = repoInfo.issues.map(_issue => {
      const issue = Object.assign({}, _issue, {
        labels: _issue.labels.map(l => ({ name: l }))
      });
      return {
        issue,
        participants: issue.participants
      };
    });

    series([
      (next) => build(repoInfo.branch, repoInfo.sha, repoInfo.deployInfo.jobs, repoInfo.config.deploy, failedAt('build', next)),
      (next) => mergeDeployBranch(repoInfo.repo, masterBranch, devBranch, repoInfo.branch, failedAt('merge', next)),
      (next) => {
        if (!deployedLabel) return next();
        releaseInfoLabel.addLabels(repoInfo.repo, releaseInfoList, [deployedLabel], failedAt('labels', next));
      },
      (next) => {
        const body = releaseNotesTemplate(Object.assign({}, repoInfo, { tag }));
        releaseService.create(repoInfo.repo, tag, body, failedAt('release', next));
      }
    ], (err) => cb(err, tag));
  };
}

// tags the error with the deploy step that failed, so the notification can tell
// "nothing was deployed" apart from "deployed but not merged/released"
function failedAt(step, cb) {
  return (err, ...results) => {
    if (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      error.deployStep = step;
      return cb(error);
    }
    cb(null, ...results);
  };
}
