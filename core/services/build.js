'use strict';

const { eachSeries } = require('async');
const { get, assignWith, cloneDeep, isNil, defaultsDeep } = require('lodash');

module.exports = (callCIDriver, localConfig) => {
  return (branch, jobs, deployConfig,  cb) => {

    const ciJobsConfig = deployConfig.ciJobs;
    const ciServicesConfig = deployConfig.ciServices;

    eachSeries(jobs, (job, nextJob) => {
      // TODO: ensure we check for ci jobs, services and drivers references in the preview step
      const ciJobConfig = get(ciJobsConfig, job.name);
      if (!ciJobConfig) return nextJob();

      const settings = combineSettings(ciJobConfig.ciService, ciServicesConfig, localConfig);
      const params = combineParams(job, branch, ciJobConfig, localConfig);

      callCIDriver(ciJobConfig.ciService, settings, params, nextJob);
      // TODO: return job execution result
    }, cb);
  }

  function combineSettings(ciService, ciServicesConfig, localConfig) {
    const repoSettings = get(ciServicesConfig, `${ciService}.settings`);
    const localSettings = get(localConfig, `deploy.ciServices.${ciService}.settings`);
    const settings = defaultsDeep({}, repoSettings, localSettings);
    return settings;
  }

  function combineParams(job, branch, repoCIJobConfig, localConfig) {
    const localCIJobConfig = get(localConfig, `deploy.ciJobs.['${job.name}']`);
    const finalCIJobConfig = defaultsDeep({}, repoCIJobConfig, localCIJobConfig);
    const params = applyBooleanDefaults(job.params, finalCIJobConfig.defaultParams);

    if (finalCIJobConfig.servicesParam) {
      params[finalCIJobConfig.servicesParam.paramName] = job.deployTo.join(finalCIJobConfig.servicesParam.separator);
    }

    if (finalCIJobConfig.sourceVersionParam) {
      params[finalCIJobConfig.sourceVersionParam.paramName] = branch;
    }

    return params
  }

  function applyBooleanDefaults(originalObj, defaultObj) {
    const finalObj = cloneDeep(defaultObj);
    return assignWith(finalObj, originalObj, (defaultProp, originalProp) => {
      return isNil(originalProp) ? defaultProp : originalProp;
    });
  }
}
