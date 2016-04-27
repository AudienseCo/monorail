'use strict';

require('should');
const sinon = require('sinon');
const EventEmitter = require('events');
const createDeployNotesSubscriber = require('../../../../../core/services/checkers/deploy-notes/deployNotesSubscriber');
const createDeployNotesService = require('../../../../../core/services/checkers/deploy-notes/deployNotesService');

describe('Deploy notes subscriber', () => {
  function createDeployNotesCheckerDummy(result) {
    return {
      checkPullRequest: (prInfo, cb) => {
        cb(null, result);
      }
    };
  }

  function createGithubDummy(result) {
    return {
      getPullRequest: (issue, cb) => {
        cb(null, result);
      },
      updateCommitStatus: (status, cb) => {
        cb(null, result);
      }
    };
  }

  context('Interface', () => {
    const deployNotesSubscriber = createDeployNotesSubscriber();
    it('should have the "subscribe" method', () => {
      deployNotesSubscriber.subscribe.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should subscribe to the "pull_request" event', done => {
      const emitter = new EventEmitter();
      const spy = sinon.spy(emitter, 'on');
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter);
      deployNotesSubscriber.subscribe();
      spy.calledWith('pull_request').should.be.ok();
      done();
    });

    it('should subscribe to the "issue_comment" event', done => {
      const emitter = new EventEmitter();
      const spy = sinon.spy(emitter, 'on');
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter);
      deployNotesSubscriber.subscribe();
      spy.calledWith('issue_comment').should.be.ok();
      done();
    });

    it('should call the deploy notes checker on new pull requests', done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'opened',
        number: 1234,
        pull_request: {}
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it('should not call the deploy notes service on close a pull request', done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'closed',
        number: 1234,
        pull_request: {}
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });

    it(`should call the deploy notes service when a user comment "check
    deploy notes please"`, done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'check deploy notes please'
        }
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it(`should call the deploy notes service when a user comment "check deploy
    notes please" (case insensitive)`, done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'Check deploy notes please'
        }
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it('should not call the deploy notes service when a user write any comment on the PR', done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'Dummy text comment'
        }
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });

    it('should not call the deploy notes service for a comment on an issue', done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
        },
        comment: {
          body: 'check deploy notes please'
        }
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });
  });
});
