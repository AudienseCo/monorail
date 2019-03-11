'use strict';

module.exports = function(IncomingWebhook, webhookUrl) {
  const that = {};
  const webhook = new IncomingWebhook(webhookUrl);

  that.send = (text, cb) => {
    webhook.send(text, cb);
  };

  return that;
};
