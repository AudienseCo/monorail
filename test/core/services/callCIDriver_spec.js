'use scrict';

const should = require('should');
const sinon = require('sinon');
const createCallCIDriver = require('../../../core/services/callCIDriver');
const repoConfig = require('../../fixtures/repoConfig.json');

describe('callCIDriver service', () => {
  it('should fail if the job fails', (done) => {
    const ciDrivers = createCIDriversDummy(null, false);
    const callCIDriver = createCallCIDriver(ciDrivers);

    const driverName = 'jenkins';
    const settings = {};
    const jobName = '';
    const params = {};
    callCIDriver(driverName, settings, jobName, params, (err) => {
      should.exist(err);
      err.message.should.be.eql('CI job failed');
      done();
    });
  });

  it('call the jenkins build driver', (done) => {
    ciDrivers = createCIDriversDummy(null, true);
    const callCIDriver = createCallCIDriver(ciDrivers);
    const jenkinsSpy = sinon.spy(ciDrivers, 'jenkins');

    const driverName = 'jenkins';
    const settings = repoConfig.deploy.ciServices.jenkins.settings;
    const jobName = 'nodejs v8.6.0';
    const params = {
      token: 'job token',
      branch: 'deploy-branch',
      node_version: 'v8.6.0',
      grunt: false,
      static_files_version: '',
      statics: false,
      where_to_deploy: 'task-as,globalreports-as'
    };
    callCIDriver(driverName, settings, jobName, params, (err) => {
      should.not.exist(err);
      jenkinsSpy.withArgs(settings, jobName, params).calledOnce.should.be.ok();
      done();
    });
  });

  function createCIDriversDummy(err, res) {
    return {
      jenkins: (settings, jobName, params, cb) => cb(err, res)
    };
  }
});
