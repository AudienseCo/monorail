'use strict';

const { URL } = require('url');
const { waterfall, doUntil } = require('async');
const logger = require('../../../lib/logger');

module.exports = (jenkinsApi) => {
  let jenkins;

  return (settings, jobName, params, cb) => {
    const pollingInterval = settings.pollingInterval;

    try {
      jenkins = createClient(settings);
    }
    catch (err) {
      logger.error('Error creating jenkins client', err);
      return cb(new Error('Invalid jenkins settings'));
    }

    waterfall([
      (next)                  => build(jobName, params, (err, queueItemNumber) => {
        if (err) return next(withContext(err, `Error triggering Jenkins job ${jobName}`));
        next(null, queueItemNumber);
      }),
      (queueItemNumber, next) => pollQueue(queueItemNumber, pollingInterval, next),
      (buildNumber, next)     => pollBuild(jobName, buildNumber, pollingInterval, next)
    ], cb);
  };

  function createClient(settings) {
    const baseUrl = new URL(settings.url);
    baseUrl.username = settings.username;
    baseUrl.password = settings.password;
    return jenkinsApi({ baseUrl: baseUrl.href });
  }

  function build(jobName, params, cb) {
    const options = {
      name: jobName,
      parameters: Object.assign({}, params),
      token: params.token
    };
    delete options.parameters.token;

    jenkins.job.build(options, cb);
  }

  function pollQueue(itemNumber, pollingInterval, cb) {
    let stop = false;
    let buildNumber;

    doUntil(
      next => {
        jenkins.queue.item(itemNumber, (err, data) => {
          if (err) return next(withContext(err, `Error polling Jenkins queue item ${itemNumber}`));
          if (!data.executable) return setTimeout(() => next(), pollingInterval);
          stop = true;
          buildNumber = data.executable.number;
          next();
        });
      },
      () => stop,
      err => cb(err, buildNumber)
    );
  }

  function buildFailedError(jobName, buildNumber, data) {
    const error = new Error(`Jenkins job ${jobName} #${buildNumber} finished with ${data.result}${data.url ? ` (${data.url})` : ''}`);
    error.ciBuild = { jobName, buildNumber, result: data.result, url: data.url };
    return error;
  }

  function withContext(err, context) {
    const error = new Error(`${context}: ${err.message}`);
    error.cause = err;
    if (err.statusCode || err.status) error.status = err.statusCode || err.status;
    return error;
  }

  function pollBuild(jobName, buildNumber, pollingInterval, cb) {
    let stop = false;
    let success;

    doUntil(
      next => {
        jenkins.build.get(jobName, buildNumber, (err, data) => {
          if (err) return next(withContext(err, `Error polling Jenkins build ${jobName} #${buildNumber}`));
          if (data.building) return setTimeout(() => next(), pollingInterval);
          stop = true;
          success = data.result === 'SUCCESS';
          if (!success) return next(buildFailedError(jobName, buildNumber, data));
          next();
        });
      },
      () => stop,
      err => cb(err, success)
    );
  }

}
