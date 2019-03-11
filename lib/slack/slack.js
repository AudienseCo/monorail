'use strict';

module.exports = function(IncomingWebhook, webhookUrl) {
  const that = {};
  const webhook = new IncomingWebhook(webhookUrl);

  that.send = (msg, cb) => {
    webhook.send(msg, cb);
  };

  return that;
};
