'use strict';
const { URL } = require('url');
const { waterfall, doUntil } = require('async');

module.exports = (jenkinsApi) => {
  let jenkins;

  return (settings, params, cb) => {
    const pollingInterval = settings.pollingInterval;
    jenkins = createClient(settings);

    waterfall([
      (next)                  => build(params, next),
      (queueItemNumber, next) => pollQueue(queueItemNumber, pollingInterval, next),
      (buildNumber, next)     => getBuildResult(params.name, buildNumber, next)
    ], cb);
  };

  function createClient(settings) {
    const baseUrl = new URL(settings.url);
    baseUrl.username = settings.username;
    baseUrl.password = settings.password;
    return jenkinsApi({ baseUrl: baseUrl.href });
  }

  function build(params, cb) {
    // TODO: properly pass name and token
    const options = {
      name: params.name,
      parameters: Object.assign({}, params),
      token: params.token
    };
    delete options.parameters.name;
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
      // TODO: test and handle failed builds
      cb(null, data.result === 'SUCCESS');
    });
  }
}
