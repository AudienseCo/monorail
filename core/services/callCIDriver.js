'use strict';
const logger = require('../../lib/logger');

module.exports = (ciDrivers) => {
  return (driverName, settings, jobName, params, cb) => {
    const ciDriver = ciDrivers[driverName];
    if (!ciDriver) return cb(new Error('invalid CI driver'));
    ciDriver(settings, jobName, params, (err, success) => {
      const error = !success && !err ? new Error('CI job failed') : err;
      if (error) {
        logger.error('CI job failed', { error, driverName, settings, jobName, params });
        return cb(error);
      }
      cb();
    });
  };
};
