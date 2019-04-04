'use strict';

const should = require('should');
const sinon = require('sinon');
const createJenkinsDriver = require('../../../../lib/ciDrivers/jenkins/jenkins');

describe('jenkins API wrapper', () => {

  context('Interface', () => {
    const jenkins = createJenkinsDriver();
    it('should be a function', () => {
      jenkins.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    it('should create the client', done => {

      const jenkinsClientDummy = createJenkinsClientDummy();
      const jobBuildStub = sinon.stub(jenkinsClientDummy.job, 'build');
      jobBuildStub.onFirstCall().callsArgWith(1, null, 1);

      const queueItemStub = sinon.stub(jenkinsClientDummy.queue, 'item');
      queueItemStub.onFirstCall().callsArgWith(1, null, {});
      queueItemStub.onSecondCall().callsArgWith(1, null, { executable: { number: 2 }});

      const buildGetStub = sinon.stub(jenkinsClientDummy.build, 'get');
      buildGetStub.onFirstCall().callsArgWith(2, null, { result: 'SUCCESS'});

      const jenkinsApi = createJenkinsApiDummy(jenkinsClientDummy);
      const constructorSpy = sinon.spy(jenkinsApi);
      const jenkins = createJenkinsDriver(constructorSpy);

      const settings = {
        url: 'http://deploy.dummy.server.com:8083/',
        username: 'deployer',
        password: 'supercrypticme',
        pollingInterval: 1
      };
      const params = {
        name: 'job name',
        token: 'job token',
        param1: 'value1'
      };
      jenkins(settings, params, (err, success) => {
        should.not.exist(err);

        constructorSpy.withArgs({
          baseUrl: 'http://deployer:supercrypticme@deploy.dummy.server.com:8083/'
        }).calledOnce.should.be.ok();

        jobBuildStub.withArgs({
          name: 'job name',
          parameters: { param1: 'value1' },
          token: 'job token'
        }).calledOnce.should.be.ok();

        queueItemStub.withArgs(1).calledTwice.should.be.ok();
        queueItemStub.withArgs(1).calledTwice.should.be.ok();

        buildGetStub.withArgs('job name', 2).calledOnce.should.be.ok();

        success.should.be.ok();
        done();
      });
    });

  });

  function createJenkinsClientDummy() {
    return {
      job: {
        build: (options, cb) => cb(null, 0)
      },
      queue: {
        item: (itemNumber, cb) => cb(null, {})
      },
      build: {
        get: (jobName, buildNumber, cb) => cb(null, {})
      }
    };
  }

  function createJenkinsApiDummy(jenkinsClientDummy) {
    return (settings) => {
      return jenkinsClientDummy;
    };
  }

});

