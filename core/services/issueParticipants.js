'use strict';

const async = require('async');

module.exports = function(github, config) {
  const that = {};

  that.getParticipants = (listOrIssue, cb) => {
    const list = Array.isArray(listOrIssue) ? listOrIssue : [listOrIssue];
    const initial = [];
    async.reduce(list, initial, (participants, issueItem, done) => {
      getIssueParticipants(issueItem, (err, issueParticipants) => {
        done(err, participants.concat(issueParticipants));
      });
    }, onFinish);

    function onFinish(err, participants) {
      cb(err, participants ? map(Array.from(new Set(participants))) : []);
    }
  };

  function getIssueParticipants(issueItem, cb) {
    github.getIssueComments(issueItem.number, (err, comments) => {
      if (err) return cb(err);

      const initial = [issueItem.user.login];
      async.reduce(comments, initial, (participants, comment, done) => {
        const author = comment.user.login;
        done(null, participants.concat(author));
      }, cb);
    });
  }

  function map(participants) {
    if (!config || !config.users || !config.users.map) return participants;
    return participants.map(config.users.map);
  }

  return that;
};