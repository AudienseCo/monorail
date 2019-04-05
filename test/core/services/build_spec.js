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
    const dummyConfig = createDummyConfig({});
    const build = createBuild(callCIDriverSpy, dummyConfig);

    const branch = 'deploy-branch1';
    const jobs = [
      {
        name: 'nodejs v8.6.0',
        deployTo: ['task-as', 'globalreports-as'],
        params: {
          grunt: true,
          static_files_version: 'other',
          token: 'other token'
        }
      },
      {
        name: 'nodejs v10.0.0',
        deployTo: ['dashboard-as', 'task-as'],
        params: {
          token: '',
          statics: true
        }
      }
    ];
    const deployConfig = cloneDeep(repoConfig.deploy);
    build(branch, jobs, deployConfig, (err) => {
      should.not.exist(err);
      callCIDriverSpy.calledTwice.should.be.ok();
      callCIDriverSpy.firstCall.args[0].should.be.eql('jenkins');
      callCIDriverSpy.firstCall.args[1].should.be.eql(deployConfig.ciServices.jenkins.settings);
      callCIDriverSpy.firstCall.args[2].should.be.eql({
        token: 'other token',
        branch: 'deploy-branch1',
        node_version: 'v8.6.0',
        grunt: true,
        static_files_version: 'other',
        statics: false,
        where_to_deploy: 'task-as,globalreports-as'
      });
      callCIDriverSpy.secondCall.args[0].should.be.eql('jenkins');
      callCIDriverSpy.secondCall.args[1].should.be.eql(deployConfig.ciServices.jenkins.settings);
      callCIDriverSpy.secondCall.args[2].should.be.eql({
        token: '',
        branch: 'deploy-branch1',
        node_version: 'v10.0.0',
        grunt: false,
        static_files_version: '',
        statics: true,
        where_to_deploy: 'dashboard-as,task-as'
      });
      done();
    });
  });

  it('call the jenkins build driver getting CI service settings from local config', (done) => {
    const ciDrivers = {
      jenkins: (settings, params, cb) => cb()
    };
    const callCIDriver = createCallCIDriver(ciDrivers);
    const callCIDriverSpy = sinon.spy(callCIDriver);
    const jenkinsSettings = {
      url: 'other url',
      username: 'other user',
      password: "other pw",
      pollingInterval: 1000
    };
    const dummyConfig = createDummyConfig({ jenkinsSettings });
    const build = createBuild(callCIDriverSpy, dummyConfig);

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
    delete deployConfig.ciServices.jenkins;

    build(branch, jobs, deployConfig, (err) => {
      should.not.exist(err);
      callCIDriverSpy.calledTwice.should.be.ok();
      callCIDriverSpy.firstCall.args[0].should.be.eql('jenkins');
      callCIDriverSpy.firstCall.args[1].should.be.eql({
        url: 'other url',
        username: 'other user',
        password: "other pw",
        pollingInterval: 1000
      });
      callCIDriverSpy.firstCall.args[2].should.be.eql({
        token: 'job token',
        branch: 'deploy-branch1',
        node_version: 'v8.6.0',
        grunt: false,
        static_files_version: '',
        statics: false,
        where_to_deploy: 'task-as,globalreports-as'
      });
      done();
    });
  });

  it('call the jenkins build driver getting params from local config', (done) => {
    const ciDrivers = {
      jenkins: (settings, params, cb) => cb()
    };
    const callCIDriver = createCallCIDriver(ciDrivers);
    const callCIDriverSpy = sinon.spy(callCIDriver);
    const dummyCIJobConfig = {
      "ciService": "jenkins",
      "jobName": "monorail-tarball-ecs",
      "servicesParam": {
        "paramName": "other_where_to_deploy",
        "separator": "|"
      },
      "sourceVersionParam": {
        "paramName": "branch"
      },
      "defaultParams": {
        "token": "job token",
        "branch": "dev",
        "node_version": "v8.6.0",
        "grunt": false,
        "static_files_version": "",
        "statics": false,
        "new param": "value"
      }
    };
    const dummyConfig = createDummyConfig({ dummyCIJobConfig });
    const build = createBuild(callCIDriverSpy, dummyConfig);

    const branch = 'deploy-branch1';
    const jobs = [
      {
        name: 'nodejs v8.6.0',
        deployTo: ['task-as', 'globalreports-as'],
        params: {
          grunt: true,
          static_files_version: 'other',
          token: 'other token'
        }
      },
      {
        name: 'nodejs v10.0.0',
        deployTo: ['dashboard-as', 'task-as'],
        params: {
          token: '',
          statics: true
        }
      }
    ];
    const deployConfig = cloneDeep(repoConfig.deploy);
    delete deployConfig.ciJobs['nodejs v8.6.0'].servicesParam;
    build(branch, jobs, deployConfig, (err) => {
      should.not.exist(err);
      callCIDriverSpy.calledTwice.should.be.ok();
      callCIDriverSpy.firstCall.args[0].should.be.eql('jenkins');
      callCIDriverSpy.firstCall.args[1].should.be.eql(deployConfig.ciServices.jenkins.settings);
      callCIDriverSpy.firstCall.args[2].should.be.eql({
        token: 'other token',
        branch: 'deploy-branch1',
        node_version: 'v8.6.0',
        grunt: true,
        static_files_version: 'other',
        statics: false,
        other_where_to_deploy: 'task-as|globalreports-as',
        'new param': 'value'
      });
      callCIDriverSpy.secondCall.args[0].should.be.eql('jenkins');
      callCIDriverSpy.secondCall.args[1].should.be.eql(deployConfig.ciServices.jenkins.settings);
      callCIDriverSpy.secondCall.args[2].should.be.eql({
        token: '',
        branch: 'deploy-branch1',
        node_version: 'v10.0.0',
        grunt: false,
        static_files_version: '',
        statics: true,
        where_to_deploy: 'dashboard-as,task-as'
      });
      done();
    });
  });

  function createDummyConfig({ jenkinsSettings, dummyCIJobConfig }) {
    const dummyConfig = {};
    if (jenkinsSettings) {
      dummyConfig.deploy = {
        ciServices: {
          jenkins: {
            driver: 'jenkins',
            settings: jenkinsSettings
          }
        }
      };
    }
    if (dummyCIJobConfig) {
      dummyConfig.deploy = {
        ciJobs: {
          'nodejs v8.6.0': dummyCIJobConfig,
        }
      };
    }
    return dummyConfig;
  }
});
