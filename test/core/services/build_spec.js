'use scrict';

const should = require('should');
const { cloneDeep } = require('lodash');
const sinon = require('sinon');
const createBuild = require('../../../core/services/build');
const createCallCIDriver = require('../../../core/services/callCIDriver');

const repoConfig = require('../../fixtures/repoConfig.json');

describe('Build service', () => {
  it('call the jenkins build driver', (done) => {
    const ciDrivers = createCIDriversDummy();
    const callCIDriver = createCallCIDriver(ciDrivers);
    const callCIDriverSpy = sinon.spy(callCIDriver);
    const build = createBuild(callCIDriverSpy);

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
      callCIDriverSpy.firstCall.args[1].should.be.eql(deployConfig.ciServices.jenkins_deploy.settings);
      callCIDriverSpy.firstCall.args[2].should.be.eql('monorail-tarball-ecs');
      callCIDriverSpy.firstCall.args[3].should.be.eql({
        token: 'other token',
        branch: 'deploy-branch1',
        node_version: 'v8.6.0',
        grunt: true,
        static_files_version: 'other',
        statics: false,
        where_to_deploy: 'task-as,globalreports-as'
      });
      callCIDriverSpy.secondCall.args[0].should.be.eql('jenkins');
      callCIDriverSpy.secondCall.args[1].should.be.eql(deployConfig.ciServices.jenkins_deploy.settings);
      callCIDriverSpy.firstCall.args[2].should.be.eql('monorail-tarball-ecs');
      callCIDriverSpy.secondCall.args[3].should.be.eql({
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

  it('params and defaultParams are optional', (done) => {
    const ciDrivers = createCIDriversDummy();
    const callCIDriver = createCallCIDriver(ciDrivers);
    const callCIDriverSpy = sinon.spy(callCIDriver);
    const build = createBuild(callCIDriverSpy);

    const branch = 'deploy-branch1';
    const jobs = [
      {
        name: 'nodejs v8.6.0',
        deployTo: ['task-as', 'globalreports-as']
      }
    ];
    const deployConfig = cloneDeep(repoConfig.deploy);
    delete deployConfig.ciJobs['nodejs v8.6.0'].defaultParams;

    build(branch, jobs, deployConfig, (err) => {
      should.not.exist(err);
      callCIDriverSpy.calledOnce.should.be.ok();
      callCIDriverSpy.firstCall.args[0].should.be.eql('jenkins');
      callCIDriverSpy.firstCall.args[1].should.be.eql(deployConfig.ciServices.jenkins_deploy.settings);
      callCIDriverSpy.firstCall.args[2].should.be.eql('monorail-tarball-ecs');
      callCIDriverSpy.firstCall.args[3].should.be.eql({
        branch: 'deploy-branch1',
        where_to_deploy: 'task-as,globalreports-as'
      });
      done();
    });
  });

  it('overrides sourceVersion param with path', (done) => {
    const ciDrivers = createCIDriversDummy();
    const callCIDriver = createCallCIDriver(ciDrivers);
    const callCIDriverSpy = sinon.spy(callCIDriver);
    const build = createBuild(callCIDriverSpy);

    const branch = 'deploy-branch1';
    const jobs = [
      {
        name: 'nodejs v8.6.0',
        deployTo: ['task-as', 'globalreports-as']
      }
    ];
    const deployConfig = cloneDeep(repoConfig.deploy);
    delete deployConfig.ciJobs['nodejs v8.6.0'].sourceVersionParam.paramName;
    deployConfig.ciJobs['nodejs v8.6.0'].sourceVersionParam = {
      paramPath: 'environmentVariablesOverride[2].value'
    };
    deployConfig.ciJobs['nodejs v8.6.0'].defaultParams = {
      environmentVariablesOverride: [
        { name: 'SERVICE_GROUP', value: 'audiense' },
        { name: 'SERVICE_NAME', value: 'fake-server02' },
        { name: 'TF_VAR_image_tag', value: 'mastera2f1329a' }
      ]
    };

    build(branch, jobs, deployConfig, (err) => {
      should.not.exist(err);
      callCIDriverSpy.calledOnce.should.be.ok();
      callCIDriverSpy.firstCall.args[3].should.be.eql({
        environmentVariablesOverride: [
          { name: 'SERVICE_GROUP', value: 'audiense' },
          { name: 'SERVICE_NAME', value: 'fake-server02' },
          { name: 'TF_VAR_image_tag', value: 'deploy-branch1' }
        ],
        where_to_deploy: 'task-as,globalreports-as'
      });
      done();
    });
  });

  function createCIDriversDummy() {
    return {
      jenkins: (settings, jobName, params, cb) => cb(null, true)
    };
  }

});
