'use strict';

const { eachSeries } = require('async');
const { get, assignWith, cloneDeep, isNil, defaultsDeep } = require('lodash');

module.exports = (callCIDriver, localConfig) => {
  return (branch, jobs, deployConfig,  cb) => {

    eachSeries(jobs, (job, nextJob) => {
      // TODO: ensure we check for ci jobs, services and drivers references in the preview step

      const ciServiceName = getCIServiceName(job, deployConfig, localConfig);
      if (!ciServiceName) {
        console.error(`Not valid config for job: ${job.name}`)
        return nextJob();
      }

      const finalCIService = combineCIServiceConfigs(ciServiceName, deployConfig, localConfig);
      const finalCIJob = combineCIJobConfigs(job, branch, deployConfig, localConfig);
      callCIDriver(finalCIService.driver, finalCIService.settings, finalCIJob.jobName, finalCIJob.params, nextJob);
    }, cb);
  }

  function getCIServiceName(job, repoDeployConfig, localConfig) {
    const repoCIServiceName = get(repoDeployConfig, `ciJobs['${job.name}'].ciService`);
    const localCIServiceName = get(localConfig, `deploy.ciJobs['${job.name}'].ciService`);
    return repoCIServiceName || localCIServiceName;
  }

  function combineCIServiceConfigs(ciService, repoDeployConfig, localConfig) {
    const repoSettings = get(repoDeployConfig, `ciServices['${ciService}']`);
    const localSettings = get(localConfig, `deploy.ciServices['${ciService}']`);
    return defaultsDeep({}, repoSettings, localSettings);
  }

  function combineCIJobConfigs(job, branch, repoDeployConfig, localConfig) {
    const repoCIJobConfig = get(repoDeployConfig, `ciJobs['${job.name}']`);
    const localCIJobConfig = get(localConfig, `deploy.ciJobs['${job.name}']`);
    const finalCIJobConfig = defaultsDeep({}, repoCIJobConfig, localCIJobConfig);
    const params = applyBooleanDefaults(job.params, finalCIJobConfig.defaultParams);

    if (finalCIJobConfig.servicesParam) {
      params[finalCIJobConfig.servicesParam.paramName] = job.deployTo.join(finalCIJobConfig.servicesParam.separator);
    }

    if (finalCIJobConfig.sourceVersionParam) {
      params[finalCIJobConfig.sourceVersionParam.paramName] = branch;
    }

    return {
      params,
      jobName: finalCIJobConfig.jobName
    };
  }

  function applyBooleanDefaults(originalObj, defaultObj) {
    const finalObj = cloneDeep(defaultObj);
    return assignWith(finalObj, originalObj, (defaultProp, originalProp) => {
      return isNil(originalProp) ? defaultProp : originalProp;
    });
  }
}
