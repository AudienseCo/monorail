'use strict';

module.exports = function(incomingWebhook, { channel }) {
  const that = {};

  that.send = ({ pretext, text }, cb) => {
    const msg = {
      channel,
      attachments: [ {
        pretext,
        text
      }]
    };
    incomingWebhook.send(msg, cb);
  };

  return that;
};
