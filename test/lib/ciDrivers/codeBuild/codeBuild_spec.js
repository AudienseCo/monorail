'use strict';

const should = require('should');
const sinon = require('sinon');
const createCodeBuildDriver = require('../../../../lib/ciDrivers/codeBuild/codeBuild');


describe('CodeBuild API wrapper', () => {

  context('Interface', () => {
    const codeBuild = createCodeBuildDriver();
    it('should be a function', () => {
      codeBuild.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should create the client', done => {

      const startBuildStub = sinon.stub();
      startBuildStub.onFirstCall().callsArgWith(1, null, { build: { id: '123' } });

      const batchGetBuildsStub = sinon.stub();
      batchGetBuildsStub.onFirstCall().callsArgWith(1, null, {
        builds: [{
          currentPhase: 'COMPLETED',
          buildComplete: true,
          buildStatus: 'SUCCEEDED'
        }]
      });

      const AWSCodeBuildDummy = createAWSCodeBuildDummy(startBuildStub, batchGetBuildsStub);

      const codeBuild = createCodeBuildDriver(AWSCodeBuildDummy);

      const settings = {
        pollingInterval: 1,
        region: 'us-east-1'
      };
      const jobName = 'terraform-service-deploy-staging';
      const params = {
        sourceVersion: 'staging',
        environmentVariablesOverride: [
          { name: 'SERVICE_GROUP', value: 'audiense' },
          { name: 'SERVICE_NAME', value: 'fake-server02' },
          { name: 'TF_VAR_image_tag', value: 'mastera2f1329a' }
        ]
      };

      codeBuild(settings, jobName, params, (err, success) => {
        should.not.exist(err);
        success.should.be.true();
        done();
      });
    });

    xit('should create the client [INTEGRATION]', done => {

      const AWS = require('aws-sdk');
      const codeBuild = createCodeBuildDriver(AWS.CodeBuild);

      const settings = {
        pollingInterval: 1000,
        region: 'us-east-1'
      };
      const jobName = 'terraform-service-deploy-staging';
      const params = {
        sourceVersion: 'staging',
        environmentVariablesOverride: [
          { name: 'SERVICE_GROUP', value: 'audiense' },
          { name: 'SERVICE_NAME', value: 'fake-server02' },
          { name: 'TF_VAR_image_tag', value: 'mastera2f1329a' }
        ]
      };

      codeBuild(settings, jobName, params, (err, success) => {
        should.not.exist(err);
        success.should.be.true();
        done();
      });
    });

    function createAWSCodeBuildDummy(startBuildStub, batchGetBuildsStub) {
      function CodeBuild(settings) {

      }

      CodeBuild.prototype.startBuild = function(params, cb) {
        startBuildStub(params, cb);
      };

      CodeBuild.prototype.batchGetBuilds = function(params, cb) {
        batchGetBuildsStub(params, cb);
      };

      return CodeBuild;
    }

  });
});
