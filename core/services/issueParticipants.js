'use strict';

const async = require('async');

module.exports = function(github, config) {
  const that = {};

  that.getParticipants = (repo, listOrIssue, cb) => {
    const list = Array.isArray(listOrIssue) ? listOrIssue : [listOrIssue];
    const initial = [];
    async.reduce(list, initial, (participants, issueItem, done) => {
      getIssueParticipants(repo, issueItem, (err, issueParticipants) => {
        done(err, participants.concat(issueParticipants));
      });
    }, onFinish);

    function onFinish(err, participants) {
      cb(err, participants ? map(Array.from(new Set(participants))) : []);
    }
  };

  function getIssueParticipants(repo, issueItem, cb) {
    github.getIssueComments(repo, issueItem.number, (err, comments) => {
      if (err) return cb(err);

      const initial = [issueItem.user.login];
      async.reduce(comments, initial, (participants, comment, done) => {
        const author = comment.user.login;
        done(null, participants.concat(author));
      }, cb);
    });
  }

  function map(participants) {
    if (!config || !config.slack || !config.slack.users || !config.slack.users.map) return participants;
    return participants.map(config.slack.users.map);
  }

  return that;
};
