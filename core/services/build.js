'use strict';

const { eachSeries } = require('async');
const { set, get, assignWith, cloneDeep, isNil } = require('lodash');
const logger = require('../../lib/logger');

module.exports = (callCIDriver) => {
  return (branch, jobs, deployConfig,  cb) => {

    eachSeries(jobs, (job, nextJob) => {

      const ciServiceName = get(deployConfig, `ciJobs['${job.name}'].ciService`);
      if (!ciServiceName) {
        logger.error(`Not valid config for job: ${job.name}`)
        return nextJob();
      }

      const ciService = get(deployConfig, `ciServices['${ciServiceName}']`);
      if (!ciService) {
        logger.error(`Not valid config for ciService: ${ciServiceName}`)
        return nextJob();
      }

      const finalCIJob = combineCIJobConfigs(job, branch, deployConfig);
      if (!finalCIJob) {
        logger.error(`Not valid config for ciJob: ${job.name}`)
        return nextJob();
      }

      callCIDriver(ciService.driver, ciService.settings, finalCIJob.jobName, finalCIJob.params, nextJob);
    }, cb);
  }

  function combineCIJobConfigs(job, branch, repoDeployConfig) {
    const repoCIJobConfig = get(repoDeployConfig, `ciJobs['${job.name}']`);
    if (!repoCIJobConfig) return;

    const params = applyBooleanDefaults(job.params, repoCIJobConfig.defaultParams);

    if (repoCIJobConfig.servicesParam) {
      set(params, repoCIJobConfig.servicesParam.paramName, job.deployTo.join(repoCIJobConfig.servicesParam.separator));
    }

    if (repoCIJobConfig.sourceVersionParam) {
      set(params, repoCIJobConfig.sourceVersionParam.paramName, branch);
    }

    return {
      params,
      jobName: repoCIJobConfig.jobName
    };
  }

  function applyBooleanDefaults(originalObj, defaultObj) {
    const finalObj = cloneDeep(defaultObj);
    return assignWith(finalObj, originalObj, (defaultProp, originalProp) => {
      return isNil(originalProp) ? defaultProp : originalProp;
    });
  }
}
