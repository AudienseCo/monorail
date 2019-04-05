'use strict';

module.exports = (ciDrivers) => {
  return (driverName, settings, params, cb) => {
    const ciDriver = ciDrivers[driverName];
    if (!ciDriver) return cb(new Error('invalid CI driver'));
    ciDriver(settings, params, cb);
  };
};
