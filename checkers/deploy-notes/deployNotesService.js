'use strict';

module.exports = function createDeployNotesService(deployNotesChecker, github) {
  let that = {};

  that.updatePullRequestCommit = (prInfo, cb) => {
    console.log('updatePullRequestCommit', prInfo);
    deployNotesChecker.checkPullRequest(prInfo, (err, status) => {
      console.log('checkPullRequest', status);
      github.updateCommitStatus(status, (err, result) => {
        if (err) console.log('Update commit state error', err);
        else console.log(`Updated commit state: sha="${status.sha}"
          state="${status.state}"`);
      });
    });
  };

  return that;
};
