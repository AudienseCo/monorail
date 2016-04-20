'use strict';

const async = require('async');

module.exports = function(prDeployInfo) {
  return function(ids, cb) {

    const initial = {
      deployNotes: false,
      services: []
    };

    async.reduce(ids, initial, (acc, id, next) => {
      prDeployInfo.get(id, (err, prInfo) => {
        if (err) return next(err);

        const newState = {
          deployNotes: acc.deployNotes || prInfo.deployNotes,
          services: Array.from(new Set(acc.services.concat(prInfo.services)))
        };
        next(null, newState);

      });
    }, cb);
  };
};
