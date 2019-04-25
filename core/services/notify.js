'use strict';

const { get } = require('lodash');
const { eachSeries } = require('async');

module.exports = (templates, slack, config) => {
  return (reposInfo, notificationName, cb) => {
    const template = templates[notificationName];
    if (!template) return cb(new Error('No template defined for this notification name'));
    const notificationSettings = get(config, `slack.notifications['${notificationName}']`);
    if (!notificationSettings) return cb(new Error('There are no settings for this notification name'));

    eachSeries(notificationSettings, (channelInfo, next) => {
      const msg = template(reposInfo, channelInfo.labels);
      if (!msg) return next();
      // TODO: publish verbose errors in another channel
      slack.send(channelInfo.channel, msg, next);
    }, cb);
  };
}
