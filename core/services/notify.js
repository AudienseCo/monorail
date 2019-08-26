'use strict';

const { get } = require('lodash');
const { eachSeries } = require('async');

const logger = require('../../lib/logger');

module.exports = (templates, slack, config) => {
  return (reposInfo, notificationName, verbose, cb) => {
    const template = templates[notificationName];
    if (!template) return cb(new Error(`No template defined for this notification name: ${notificationName}`));
    const notificationSettings = get(config, `slack.notifications['${notificationName}']`);
    if (!notificationSettings) return cb(new Error(`There are no settings for this notification name: ${notificationName}`));

    const msgs = {};
    eachSeries(notificationSettings, (channelInfo, next) => {
      const msg = template(reposInfo, channelInfo.labels, verbose);
      if (!msg) return next();
      // TODO: publish verbose errors in another channel
      msgs[channelInfo.channel] = msg;
      logger.debug(`Sending message to slack: ${JSON.stringify(msg)}}`, channelInfo.channel, msg);
      slack.send(channelInfo.channel, msg, next);
    }, err => cb(err, msgs));
  };
}
