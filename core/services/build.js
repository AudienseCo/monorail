'use strict';

const { eachSeries } = require('async');
const { get, assignWith, cloneDeep, isNil } = require('lodash');

module.exports = (callCIDriver, localConfig) => {
  return (branch, jobs, deployConfig,  cb) => {

    const ciJobsConfig = deployConfig.ciJobs;
    const ciServicesConfig = deployConfig.ciServices;

    eachSeries(jobs, (job, nextJob) => {
      // TODO: ensure we check for ci jobs, services and drivers references in the preview step
      const ciJobConfig = get(ciJobsConfig, job.name);
      if (!ciJobConfig) return nextJob();

      const settings = combineSettings(ciJobConfig.ciService, ciServicesConfig, localConfig);
      const params = combineParams(job, ciJobConfig, branch);

      callCIDriver(ciJobConfig.ciService, settings, params, nextJob);
      // TODO: return job execution result
    }, cb);
  }

  function combineSettings(ciService, ciServicesConfig, localConfig) {
    const repoSettings = get(ciServicesConfig, `${ciService}.settings`);
    const localSettings = get(localConfig, `deploy.ciServices.${ciService}.settings`);
    const settings = applyDefaults(repoSettings, localSettings);
    return settings;
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

  function applyDefaults(originalObj, defaultObj) {
    const finalObj = cloneDeep(originalObj);
    return assignWith(defaultObj, finalObj, (defaultProp, originalProp) => {
      return isNil(originalProp) ? defaultProp : originalProp;
    });
  }
}
