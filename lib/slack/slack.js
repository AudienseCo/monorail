'use strict';

module.exports = function(incomingWebhook, { channel }) {
  const that = {};

  that.send = (msg, cb) => {
    const finalMsg = Object.assign({ channel }, msg);
    incomingWebhook.send(finalMsg, cb);
  };

  return that;
};
