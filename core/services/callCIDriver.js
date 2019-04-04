'use strict';

module.exports = (ciDrivers) => {
  return (ciServiceConfig, params, cb) => {
    const ciDriver = ciDrivers[ciServiceConfig.driver];
    if (!ciDriver) return cb(new Error('invalid CI driver'));
    ciDriver(ciServiceConfig.settings, params, cb);
  };
};
