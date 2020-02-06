'use strict';

const { get, cloneDeep, defaultsDeep, forIn, keys } = require('lodash');
const logger = require('../../lib/logger');

module.exports = (getRepoConfig, localConfig, ciDrivers) => {
  return (repo, cb) => {
    getRepoConfig(repo, (err, repoConfig) => {
      if (err) return cb(err);
      const config = cloneDeep(repoConfig);

      config.github = defaultsDeep({}, config.github, localConfig.github);
      config.deploy = defaultsDeep({}, config.deploy, localConfig.deploy);
      verify(config, cb);
    });
  };

  function verify(config, cb) {
    try {
      verifyGithubSettings(config.github);
      verifyCIServicesSettings(config.deploy.ciServices);
      verifyCIJobsSettings(config.deploy.ciServices, config.deploy.ciJobs);
      verifyServicesSettings(config.deploy.ciJobs, config.deploy.services);
    }
    catch(err) {
      return cb(err);
    }
    cb(null, config);
  }

  function verifyGithubSettings(github) {
    const expectedSettings = [
      { paths: ['repos'] },
      { paths: ['user'] },
      { paths: ['token'] },
      { paths: ['masterBranch'] },
      { paths: ['devBranch'] },
      { paths: ['deployedLabel'] },
      { paths: ['deployNotesLabel'] }
    ];
    verifySettings('github', github, expectedSettings);
    return true;
  }

  function verifyCIServicesSettings(ciServices) {
    if (keys(ciServices).length === 0) {
      throw Error('No "ciServices" defined');
    }
    forIn(ciServices, ciService => verifyCIServiceSettings(ciService));
    return true;
  }

  function verifyCIServiceSettings(ciService) {
    const expectedSettings = [
      { paths: ['driver'] },
      { paths: ['settings'] }
    ];
    verifySettings(`${ciService} ciService`, ciService, expectedSettings);

    // TODO: verify jenkins specific settings
    if (!get(ciDrivers, ciService.driver)) {
      throw Error(`No driver available for "${ciService.driver}"`);
    }

    return true;
  }

  function verifyCIJobsSettings(ciServices, ciJobs) {
    if (keys(ciJobs).length === 0) {
      throw Error('No "ciJobs" defined');
    }
    forIn(ciJobs, ciJob => verifyCIJobSettings(ciServices, ciJob));
    return true;
  }

  function verifyCIJobSettings(ciServices, ciJob) {
    const expectedSettings = [
      { paths: ['ciService'] },
      { paths: ['jobName'] },
      { paths: ['servicesParam.paramName', 'servicesParam.pathName'], optional: true },
      { paths: ['servicesParam.separator'], optional: true},
      { paths: ['sourceVersionParam.paramName', 'sourceVersionParam.pathName']}
    ];
    verifySettings(`${ciJob} ciJob`, ciJob, expectedSettings);

    if (!get(ciServices, ciJob.ciService)) {
      throw Error(`No ciService defined for "${ciJob.ciService}"`);
    }

    return true;
  }

  function verifyServicesSettings(ciJobs, services) {
    if (keys(services).length === 0) {
      throw Error('No "services" defined');
    }
    forIn(services, service => verifyServiceSettings(ciJobs, service));
    return;
  }

  function verifyServiceSettings(ciJobs, service) {
    const expectedSettings = [
      { paths: ['ciJob'] },
      { paths: ['deployTo'] }
    ];
    verifySettings(`${service} service`, service, expectedSettings);

    if (!get(ciJobs, service.ciJob)) {
      throw Error(`No ciJob defined for "${service.ciJob}"`);
    }
  }

  function verifySettings(settingName, settings, expectedSettings) {
    for (let setting of expectedSettings) {
      const isMissing = !isAnyOfTheSettingPathsDefined(settings, setting.paths);
      if (isMissing && setting.optional) {
        logger.info(`Optional "${setting.paths.join(',')}" ${settingName} setting is missing at either system of repository config`);
      }
      else if (isMissing) {
        logger.error(`Optional "${setting.paths.join(',')}" ${settingName} setting is missing at either system of repository config`);
        throw Error(`"${setting.paths.join(',')}" ${settingName} setting is missing at either system of repository config`);
      }
    }
    return true;
  }

  function isAnyOfTheSettingPathsDefined(settings, expectedSettingPaths) {
    return expectedSettingPaths.some(path => get(settings, path));
  }

};
