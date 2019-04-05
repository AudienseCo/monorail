'use scrict';

const should = require('should');
const { cloneDeep } = require('lodash');
const sinon = require('sinon');
const createBuild = require('../../../core/services/build');
const createCallCIDriver = require('../../../core/services/callCIDriver');

const repoConfig = require('../../fixtures/repoConfig.json');

describe('Build service', () => {
  it('call the jenkins build driver', (done) => {
    const ciDrivers = {
      jenkins: (settings, params, cb) => cb()
    };
    const callCIDriver = createCallCIDriver(ciDrivers);
    const callCIDriverSpy = sinon.spy(callCIDriver);
    const build = createBuild(callCIDriverSpy);

    const branch = 'deploy-branch1';
    const jobs = [
      {
        name: 'nodejs v8.6.0',
        deployTo: ['task-as', 'globalreports-as'],
        params: {}
      },
      {
        name: 'nodejs v10.0.0',
        deployTo: ['dashboard-as', 'task-as'],
        params: {
          grunt: true,
          statics: true
        }
      }
    ];
    const deployConfig = cloneDeep(repoConfig.deploy);
    build(branch, jobs, deployConfig, (err) => {
      should.not.exist(err);
      callCIDriverSpy.calledTwice.should.be.ok();
      callCIDriverSpy.firstCall.args[0].should.be.eql(deployConfig.ciServices.jenkins);
      callCIDriverSpy.firstCall.args[1].should.be.eql({
        token: 'job token',
        branch: 'deploy-branch1',
        node_version: 'v8.6.0',
        grunt: false,
        static_files_version: '',
        statics: false,
        where_to_deploy: 'task-as,globalreports-as'
      });
      callCIDriverSpy.secondCall.args[0].should.be.eql(deployConfig.ciServices.jenkins);
      callCIDriverSpy.secondCall.args[1].should.be.eql({
        token: 'job token',
        branch: 'deploy-branch1',
        node_version: 'v10.0.0',
        grunt: true,
        static_files_version: '',
        statics: true,
        where_to_deploy: 'dashboard-as,task-as'
      });
      done();
    });
  });
});
