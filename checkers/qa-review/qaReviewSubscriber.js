'use strict';

module.exports = function(emitter, deployNotesService) {
  let that = {
    subscribe: () => {
      emitter.on('pull_request', payload => {
        if (payload.action === 'opened' || payload.action === 'labeled' ||
        payload.action === 'unlabeled') {
          const prInfo = payload.pull_request;
          deployNotesService.updatePullRequestCommit(prInfo);
        }
      });
    }
  };
  return that;
};
