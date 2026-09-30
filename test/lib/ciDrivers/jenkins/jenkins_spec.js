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
      const jobName = 'job name';
      const params = {
        token: 'job token',
        param1: 'value1'
      };
      jenkins(settings, jobName, params, (err, success) => {
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

    it('should fail with the build number, result and url when the build does not succeed', done => {
      const jenkinsClientDummy = createJenkinsClientDummy();
      sinon.stub(jenkinsClientDummy.job, 'build').callsArgWith(1, null, 1);
      sinon.stub(jenkinsClientDummy.queue, 'item').callsArgWith(1, null, { executable: { number: 8217 } });
      sinon.stub(jenkinsClientDummy.build, 'get').callsArgWith(2, null, { building: false, result: 'UNSTABLE', url: 'http://jenkins/job/deploy/8217/' });
      const jenkins = createJenkinsDriver(createJenkinsApiDummy(jenkinsClientDummy));

      jenkins({ url: 'http://jenkins/', pollingInterval: 1 }, 'deploy', {}, (err) => {
        should.exist(err);
        err.message.should.be.eql('Jenkins job deploy #8217 finished with UNSTABLE (http://jenkins/job/deploy/8217/)');
        err.ciBuild.should.be.eql({ jobName: 'deploy', buildNumber: 8217, result: 'UNSTABLE', url: 'http://jenkins/job/deploy/8217/' });
        done();
      });
    });

    it('should tell which Jenkins call failed', done => {
      const jenkinsClientDummy = createJenkinsClientDummy();
      sinon.stub(jenkinsClientDummy.job, 'build').callsArgWith(1, null, 1);
      sinon.stub(jenkinsClientDummy.queue, 'item').callsArgWith(1, null, { executable: { number: 8217 } });
      const socketError = new Error('socket hang up');
      sinon.stub(jenkinsClientDummy.build, 'get').callsArgWith(2, socketError);
      const jenkins = createJenkinsDriver(createJenkinsApiDummy(jenkinsClientDummy));

      jenkins({ url: 'http://jenkins/', pollingInterval: 1 }, 'deploy', {}, (err) => {
        should.exist(err);
        err.message.should.be.eql('Error polling Jenkins build deploy #8217: socket hang up');
        err.cause.should.be.equal(socketError);
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

