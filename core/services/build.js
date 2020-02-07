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
      if (repoCIJobConfig.servicesParam.paramPath) {
        set(params, repoCIJobConfig.servicesParam.paramPath, job.deployTo.join(repoCIJobConfig.servicesParam.separator));
      }
      else params[repoCIJobConfig.servicesParam.paramName] = job.deployTo.join(repoCIJobConfig.servicesParam.separator);
    }

    if (repoCIJobConfig.sourceVersionParam) {
      if (repoCIJobConfig.sourceVersionParam.paramPath) {
        set(params, repoCIJobConfig.sourceVersionParam.paramPath, branch);
      }
      else params[repoCIJobConfig.sourceVersionParam.paramName] = branch;
    }

    if (repoCIJobConfig.shaParam) {
      if (repoCIJobConfig.shaParam.paramPath) {
        set(params, repoCIJobConfig.shaParam.paramPath, branch);
      }
      else params[repoCIJobConfig.shaParam.paramName] = branch;
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
