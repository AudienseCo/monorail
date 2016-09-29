'use strict';

module.exports = function(emitter, deployLabelsService) {
  const that = {
    subscribe: () => {
      emitter.on('pull_request', payload => {
        if (payload.action === 'opened' || payload.action === 'labeled' ||
        payload.action === 'unlabeled' || payload.action === 'synchronize') {
          const prInfo = payload.pull_request;
          deployLabelsService.updatePullRequestCommit(prInfo);
        }
      });

      emitter.on('issue_comment', payload => {
        if (payload.action === 'created' && payload.issue && payload.issue.pull_request) {
          if (payload.comment.body.toLowerCase() === 'check deploy labels please') {
            const prInfo = payload.issue;
            deployLabelsService.updatePullRequestCommit(prInfo);
          }
        }
      });
    }
  };
  return that;
};
