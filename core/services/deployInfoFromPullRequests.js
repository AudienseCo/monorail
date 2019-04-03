'use strict';

const { reduce } = require('async');
const { get, union, assign, assignWith, find } = require('lodash');

// TODO: get deploy notes label from config
// TODO: ensure that the ci job exists
// TODO: ensure that the same service isn't deployed several times with different jobs
module.exports = (pullRequestDeployInfo) => {

  return (repo, pullRequestList, repoConfig, cb) => {
    const initial = {
      deployNotes: false,
      services: []
    };

    reduce(pullRequestList, initial, (acc, id, next) => {
      pullRequestDeployInfo.get(repo, id, (err, prInfo) => {
        if (err) return next(err);
        const newState = {
          deployNotes: acc.deployNotes || prInfo.deployNotes,
          services: union(acc.services, prInfo.services)
        };
        next(null, newState);
      });
    }, (err, result) => {
      if (err) return cb(err);
      cb(null, {
        deployNotes: result.deployNotes,
        jobs: groupServicesByJob(repoConfig, result.services)
      });
    });
  };

  function groupServicesByJob(repoConfig, services, cb) {
    return services.reduce((jobs, service) => {
      const serviceConfig = get(repoConfig, `services.${service}`);
      if (!serviceConfig) return jobs;
      const jobConfig = find(jobs, { name: serviceConfig.CIJob });
      if (jobConfig) {
        jobConfig.deployTo = union(jobConfig.deployTo, serviceConfig.deployTo);
        assignWith(jobConfig.params, serviceConfig.params, (jobParam, serviceParam) => {
          return serviceParam || jobParam;
        });
      }
      else {
        jobs.push({
          name: serviceConfig.CIJob,
          deployTo: union([], serviceConfig.deployTo),
          params: assign({}, serviceConfig.params)
        });
      }
      return jobs;
    }, []);
  }

};
