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

    const ciServiceConfig = repoConfig.deploy.ciServices.jenkins;
    const params = {
      token: 'job token',
      branch: 'deploy-branch',
      node_version: 'v8.6.0',
      grunt: false,
      static_files_version: '',
      statics: false,
      where_to_deploy: 'task-as,globalreports-as'
    };
    callCIDriver(ciServiceConfig, params, (err) => {
      should.not.exist(err);
      jenkinsSpy.withArgs(ciServiceConfig.settings, params).calledOnce.should.be.ok();
      done();
    });
  });
});
