'use strict';

const async = require('async');

module.exports = function(prDeployInfo, config) {
  return function(ids, cb) {

    const initial = {
      deployNotes: false,
      services: []
    };

    async.reduce(ids, initial, (acc, id, next) => {
      prDeployInfo.get(id, (err, prInfo) => {
        if (err) return next(err);
        const prServices = map(prInfo.services, config);
        const services = Array.from(new Set(acc.services.concat(prServices)));
        const newState = {
          deployNotes: acc.deployNotes || prInfo.deployNotes,
          services: services
        };
        next(null, newState);

      });
    }, (err, result) => {
      if (err) cb(err);
      else cb(null, reduce(result, config));
    });
  };
};

function map(services, config) {
  const mapper = config.services ? config.services.mapper : null;

  if (mapper) return services.map(mapper);
  else return services;
}

function reduce(data, config) {
  const reducer = config.services ? config.services.reducer : null;

  if (reducer && data.services.length) {
    return Object.assign({}, data, { services: data.services.reduce(reducer, null) });
  }
  else return data;
}
