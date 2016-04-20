'use strict';

require('should');
const sinon = require('sinon');
const EventEmitter = require('events');
const createQAReviewSubscriber = require('../../../../../core/services/checkers/qa-review/qaReviewSubscriber');
const createQAService = require('../../../../../core/services/checkers/qa-review/qaReviewService');

describe('QA Review subscriber', () => {
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
    const qaReviewSubscriber = createQAReviewSubscriber();
    it('should have the "subscribe" method', () => {
      qaReviewSubscriber.subscribe.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should subscribe to the "pull_request" event', done => {
      const emitter = new EventEmitter();
      var spy = sinon.spy(emitter, 'on');
      const qaReviewSubscriber = createQAReviewSubscriber(emitter);
      qaReviewSubscriber.subscribe();
      spy.calledWith('pull_request').should.be.ok();
      done();
    });

    it('should call the qa review checker on new pull requests', done => {
      const emitter = new EventEmitter();
      const qaReviewCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const qaReviewService = createQAService(qaReviewCheckerDummy, githubDummy);
      const qaReviewSubscriber = createQAReviewSubscriber(emitter, qaReviewService);
      const spy = sinon.spy(qaReviewService, 'updatePullRequestCommit');
      const payload = {
        action: 'opened',
        number: 1234,
        pull_request: {}
      };
      qaReviewSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it('should not call the qa review service on close a pull request', done => {
      const emitter = new EventEmitter();
      const qaReviewCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const qaReviewService = createQAService(qaReviewCheckerDummy, githubDummy);
      const qaReviewSubscriber = createQAReviewSubscriber(emitter, qaReviewService);
      const spy = sinon.spy(qaReviewService, 'updatePullRequestCommit');
      const payload = {
        action: 'closed',
        number: 1234,
        pull_request: {}
      };
      qaReviewSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });

    it('should call the qa review service when a label is added', done => {
      const emitter = new EventEmitter();
      const qaReviewCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const qaReviewService = createQAService(qaReviewCheckerDummy, githubDummy);
      const qaReviewSubscriber = createQAReviewSubscriber(emitter, qaReviewService);
      const spy = sinon.spy(qaReviewService, 'updatePullRequestCommit');
      const payload = {
        action: 'labeled',
        number: 1234,
        pull_request: {}
      };
      qaReviewSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it('should call the qa review service when a label is removed', done => {
      const emitter = new EventEmitter();
      const qaReviewCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({ head: { sha: '' } });
      const qaReviewService = createQAService(qaReviewCheckerDummy, githubDummy);
      const qaReviewSubscriber = createQAReviewSubscriber(emitter, qaReviewService);
      const spy = sinon.spy(qaReviewService, 'updatePullRequestCommit');
      const payload = {
        action: 'unlabeled',
        number: 1234,
        pull_request: {}
      };
      qaReviewSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

  });
});
