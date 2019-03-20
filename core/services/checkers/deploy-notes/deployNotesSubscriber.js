'use strict';

module.exports = function(emitter, deployNotesService) {
  const that = {
    subscribe: () => {
      emitter.on('pull_request', payload => {
        if (payload.action === 'opened' || payload.action === 'labeled' ||
        payload.action === 'unlabeled' || payload.action === 'synchronize') {
          const prInfo = payload.pull_request;
          const repo = payload.repository.name;
          deployNotesService.updatePullRequestCommit(repo, prInfo);
        }
      });

      emitter.on('issue_comment', payload => {
        if (payload.action === 'created' && payload.issue && payload.issue.pull_request) {
          if (payload.comment.body.toLowerCase() === 'check deploy notes please') {
            const prInfo = payload.issue;
            const repo = payload.repository.name;
            deployNotesService.updatePullRequestCommit(repo, prInfo);
          }
        }
      });
    }
  };
  return that;
};
