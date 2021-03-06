'use strict';

module.exports = function(emitter, qaReviewService) {
  const that = {
    subscribe: () => {
      emitter.on('pull_request', payload => {
        if (payload.action === 'opened' || payload.action === 'labeled' ||
        payload.action === 'unlabeled' || payload.action === 'synchronize') {
          const prInfo = payload.pull_request;
          const repo = payload.repository.name;
          qaReviewService.updatePullRequestCommit(repo, prInfo);
        }
      });
    }
  };
  return that;
};
