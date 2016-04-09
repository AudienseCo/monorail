'use strict';

module.exports = function(emitter, deployNotesService) {
  let that = {
    subscribe: () => {
      emitter.on('pull_request', payload => {
        if (payload.action === 'opened') {
          const prInfo = payload.pull_request;
          deployNotesService.updatePullRequestCommit(prInfo);
        }
      });

      emitter.on('issue_comment', payload => {
        console.log('issue_comment');
        if (payload.action === 'created' && payload.issue && payload.issue.pull_request) {
          if (payload.comment.body.toLowerCase() === 'check deploy notes please') {
            const prInfo = payload.issue;
            deployNotesService.updatePullRequestCommit(prInfo);
          }
        }
      });
    }
  };
  return that;
};
