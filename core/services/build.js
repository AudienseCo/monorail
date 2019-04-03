'use strict';

const { eachSeries } = require('async');
const { get, assignWith } = require('lodash');

module.exports = (callCIDriver) => {
  return (branch, jobs, deployConfig,  cb) => {

    const ciJobsConfig = deployConfig.ciJobs;
    const ciServicesConfig = deployConfig.ciServices;

    eachSeries(jobs, (job, nextJob) => {
      // TODO: ensure we check for ci jobs, services and drivers references in the preview step
      const ciJobConfig = get(ciJobsConfig, job.name);
      if (!ciJobConfig) return nextJob();

      const ciServiceConfig = get(ciServicesConfig, ciJobConfig.ciService);
      if (!ciServiceConfig) return nextJob();

      const params = combineParams(job, ciJobConfig, branch);
      callCIDriver(ciServiceConfig, params, nextJob);
    }, cb);
  }

  function combineParams(job, ciJobConfig, branch) {
    // TODO: combine default params with monorail config
    const params = applyDefaults(job.params, ciJobConfig.defaultParams);

    if (ciJobConfig.servicesParam) {
      params[ciJobConfig.servicesParam.paramName] = job.deployTo.join(ciJobConfig.servicesParam.separator);
    }

    if (ciJobConfig.sourceVersionParam) {
      params[ciJobConfig.sourceVersionParam.paramName] = branch;
    }

    return params
  }

  function applyDefaults(targetObj, defaultObj) {
    return assignWith({}, targetObj, defaultObj, (targetProp, defaultProp) => {
      return targetProp || defaultProp;
    });
  }
}
