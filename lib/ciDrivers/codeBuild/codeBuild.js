'use strict';

const { waterfall, doUntil } = require('async');
const { get } = require('lodash');
const logger = require('../../../lib/logger');

module.exports = (CodeBuild) => {

  return (settings, jobName, params, cb) => {
    const { pollingInterval, region } = settings;

    const codeBuildApi = new CodeBuild({ apiVersion: '2016-10-06', region });

    waterfall([
      (next)          => build(codeBuildApi, jobName, params, next),
      (buildId, next) => pollBuild(codeBuildApi, buildId, pollingInterval, next)
    ], cb);
  }

  function build(codeBuildApi, jobName, params, cb) {
    codeBuildApi.startBuild({ projectName: jobName, ...params }, (err, data) => {
      if (err) return cb(err);
      const buildId = get(data, 'build.id');
      logger.debug('Build id', buildId);
      return cb(null, buildId);
    });
  }

  function pollBuild(codeBuildApi, buildId, pollingInterval, cb) {
    let stop = false;
    let success;

    doUntil(
      next => {
        const params = { ids: [buildId] };
        codeBuildApi.batchGetBuilds(params, (err, data) => {
          if (err) return next(err);
          if (!isCompleted(data)) return setTimeout(() => next(), pollingInterval);
          stop = true;
          success = succeeded(data);
          next();
        });
      },
      () => stop,
      err => cb(err, success)
    );
  }

  function isCompleted(data) {
    const build = get(data, 'builds[0]');
    logger.debug('Build status', build);
    return build.currentPhase === 'COMPLETED' && build.buildComplete;
  }

  function succeeded(data) {
    const build = get(data, 'builds[0]');
    return build.buildStatus === 'SUCCEEDED';
  }

};
