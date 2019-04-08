'use strict';
const { URL } = require('url');
const { waterfall, doUntil } = require('async');

module.exports = (jenkinsApi) => {
  let jenkins;

  return (settings, jobName, params, cb) => {
    const pollingInterval = settings.pollingInterval;

    try {
      jenkins = createClient(settings);
    }
    catch (err) {
      console.error('Error creating jenkins client', err);
      return cb(new Error('Invalid jenkins settings'));
    }

    waterfall([
      (next)                  => build(jobName, params, next),
      (queueItemNumber, next) => pollQueue(queueItemNumber, pollingInterval, next),
      (buildNumber, next)     => getBuildResult(jobName, buildNumber, next)
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
          if (err) return next(err);
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

  function getBuildResult(jobName, buildNumber, cb) {
    jenkins.build.get(jobName, buildNumber, (err, data) => {
      if (err) return cb(err);
      cb(null, data.result === 'SUCCESS');
    });
  }
}
