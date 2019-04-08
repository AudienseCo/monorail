'use strict';

module.exports = function(incomingWebhook) {
  const that = {};

  that.send = (channel, msg, cb) => {
    const finalMsg = Object.assign({ channel }, msg);
    incomingWebhook.send(finalMsg, cb);
  };

  return that;
};
