'use strict';

module.exports = (ciDrivers) => {
  return (driverName, settings, jobName, params, cb) => {
    const ciDriver = ciDrivers[driverName];
    if (!ciDriver) return cb(new Error('invalid CI driver'));
    ciDriver(settings, jobName, params, (err, success) => {
      if (err) return cb(err);
      if (!success) return cb(new Error('CI job failed'));
      cb();
    });
  };
};
