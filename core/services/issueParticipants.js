'use strict';

const async = require('async');

module.exports = function(github) {
  const that = {};

  that.getParticipants = (issueItem, cb) => {
    github.getIssueComments(issueItem.number, (err, comments) => {
      if (err) return cb(err);

      const initial = new Set([issueItem.user.login]);
      async.reduce(comments, initial, (participants, comment, done) => {
        const author = comment.user.login;
        done(null, participants.add(author));
      }, onFinish);
    });

    function onFinish(err, participants) {
      cb(err, participants ? Array.from(participants) : []);
    }
  };

  return that;
};
