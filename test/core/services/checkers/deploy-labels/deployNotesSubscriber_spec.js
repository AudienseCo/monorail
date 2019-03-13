'use strict';

require('should');
const sinon = require('sinon');
const EventEmitter = require('events');
const createDeployLabelsSubscriber = require('../../../../../core/services/checkers/deploy-labels/deployLabelsSubscriber');
const createDeployLabelsService = require('../../../../../core/services/checkers/deploy-labels/deployLabelsService');

describe('Deploy labels subscriber', () => {
  function createDeployLabelsCheckerDummy(result) {
    return {
      checkPullRequest: (repo, prInfo, cb) => {
        cb(null, result);
      }
    };
  }

  function createGithubDummy(result) {
    return {
      getPullRequest: (repo, issue, cb) => {
        cb(null, result);
      },
      updateCommitStatus: (status, cb) => {
        cb(null, result);
      }
    };
  }

  context('Interface', () => {
    const deployLablesSubscriber = createDeployLabelsSubscriber();
    it('should have the "subscribe" method', () => {
      deployLablesSubscriber.subscribe.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should subscribe to the "pull_request" event', done => {
      const emitter = new EventEmitter();
      const spy = sinon.spy(emitter, 'on');
      const deployLablesSubscriber = createDeployLabelsSubscriber(emitter);
      deployLablesSubscriber.subscribe();
      spy.calledWith('pull_request').should.be.ok();
      done();
    });

    it('should subscribe to the "issue_comment" event', done => {
      const emitter = new EventEmitter();
      const spy = sinon.spy(emitter, 'on');
      const deployLablesSubscriber = createDeployLabelsSubscriber(emitter);
      deployLablesSubscriber.subscribe();
      spy.calledWith('issue_comment').should.be.ok();
      done();
    });

    it('should call the deploy label checker on new pull requests', done => {
      const emitter = new EventEmitter();
      const deployLabelsCheckerDummy = createDeployLabelsCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const deployLabelsService = createDeployLabelsService(deployLabelsCheckerDummy, githubDummy);
      const deployLablesSubscriber = createDeployLabelsSubscriber(emitter, deployLabelsService);
      const spy = sinon.spy(deployLabelsService, 'updatePullRequestCommit');
      const payload = {
        action: 'opened',
        number: 1234,
        pull_request: {},
        repository: { name: '' }
      };
      deployLablesSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it('should not call the deploy labels service on close a pull request', done => {
      const emitter = new EventEmitter();
      const deployLabelsCheckerDummy = createDeployLabelsCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const deployLabelsService = createDeployLabelsService(deployLabelsCheckerDummy, githubDummy);
      const deployLablesSubscriber = createDeployLabelsSubscriber(emitter, deployLabelsService);
      const spy = sinon.spy(deployLabelsService, 'updatePullRequestCommit');
      const payload = {
        action: 'closed',
        number: 1234,
        pull_request: {},
        repository: { name: '' }
      };
      deployLablesSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });

    it(`should call the deploy labels service when a user comment "check
    deploy labels please"`, done => {
      const emitter = new EventEmitter();
      const deployLabelsCheckerDummy = createDeployLabelsCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const deployLabelsService = createDeployLabelsService(deployLabelsCheckerDummy, githubDummy);
      const deployLablesSubscriber = createDeployLabelsSubscriber(emitter, deployLabelsService);
      const spy = sinon.spy(deployLabelsService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'check deploy labels please'
        },
        repository: { name: '' }
      };
      deployLablesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it(`should call the deploy labels service when a user comment "check deploy
    labels please" (case insensitive)`, done => {
      const emitter = new EventEmitter();
      const deployLabelsCheckerDummy = createDeployLabelsCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const deployLabelsService = createDeployLabelsService(deployLabelsCheckerDummy, githubDummy);
      const deployLablesSubscriber = createDeployLabelsSubscriber(emitter, deployLabelsService);
      const spy = sinon.spy(deployLabelsService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'Check deploy labels please'
        },
        repository: { name: '' }
      };
      deployLablesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it('should not call the deploy labels service when a user write any comment on the PR', done => {
      const emitter = new EventEmitter();
      const deployLabelsCheckerDummy = createDeployLabelsCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployLabelsService = createDeployLabelsService(deployLabelsCheckerDummy, githubDummy);
      const deployLablesSubscriber = createDeployLabelsSubscriber(emitter, deployLabelsService);
      const spy = sinon.spy(deployLabelsService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'Dummy text comment'
        },
        repository: { name: '' }
      };
      deployLablesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });

    it('should not call the deploy labels service for a comment on an issue', done => {
      const emitter = new EventEmitter();
      const deployLabelsCheckerDummy = createDeployLabelsCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployLabelsService = createDeployLabelsService(deployLabelsCheckerDummy, githubDummy);
      const deployLablesSubscriber = createDeployLabelsSubscriber(emitter, deployLabelsService);
      const spy = sinon.spy(deployLabelsService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
        },
        comment: {
          body: 'check deploy labels please'
        },
        repository: { name: '' }
      };
      deployLablesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });
  });
});
