'use scrict';

const should = require('should');
const sinon = require('sinon');
const createCallCIDriver = require('../../../core/services/callCIDriver');
const repoConfig = require('../../fixtures/repoConfig.json');

describe('callCIDriver service', () => {
  it('call the jenkins build driver', (done) => {
    const ciDrivers = {
      jenkins: (settings, params, cb) => cb()
    };
    const callCIDriver = createCallCIDriver(ciDrivers);
    const jenkinsSpy = sinon.spy(ciDrivers, 'jenkins');

    const driverName = 'jenkins';
    const settings = repoConfig.deploy.ciServices.jenkins.settings;
    const params = {
      token: 'job token',
      branch: 'deploy-branch',
      node_version: 'v8.6.0',
      grunt: false,
      static_files_version: '',
      statics: false,
      where_to_deploy: 'task-as,globalreports-as'
    };
    callCIDriver(driverName, settings, params, (err) => {
      should.not.exist(err);
      jenkinsSpy.withArgs(settings, params).calledOnce.should.be.ok();
      done();
    });
  });
});
