'use strict';

require('should');
const sinon = require('sinon');
const createLogger = require('../../../lib/logger/logger');

describe('Logger wrapper', () => {
  function createLoggerWithStubs() {
    const stubs = { debug: sinon.stub(), info: sinon.stub(), error: sinon.stub() };
    return { logger: createLogger({}, () => stubs), stubs };
  }

  it('should call the logger with only the message when there are no extra arguments', () => {
    const { logger, stubs } = createLoggerWithStubs();
    logger.info('test');
    stubs.info.firstCall.args.should.be.eql(['test']);
  });

  it('should merge every extra argument into a single meta object', () => {
    const { logger, stubs } = createLoggerWithStubs();
    logger.debug('test', { a: '123' }, [1, 2, 4], 'repo1');
    stubs.debug.firstCall.args.should.be.eql(['test', { a: '123', data: [1, 2, 4], details: ['repo1'] }]);
  });

  it('should keep the error message and stack', () => {
    const { logger, stubs } = createLoggerWithStubs();
    const err = new Error('Merge conflict');
    err.status = 409;
    logger.error('Error deploying', 'repo1', err);
    const [message, meta] = stubs.error.firstCall.args;
    message.should.be.eql('Error deploying');
    meta.details.should.be.eql(['repo1']);
    meta.error.message.should.be.eql('Merge conflict');
    meta.error.status.should.be.eql(409);
    meta.error.stack.should.be.a.String();
  });

  it('should serialize errors nested in objects', () => {
    const { logger, stubs } = createLoggerWithStubs();
    logger.error('CI job failed', { error: new Error('boom'), jobName: 'job' });
    const meta = stubs.error.firstCall.args[1];
    meta.error.message.should.be.eql('boom');
    meta.jobName.should.be.eql('job');
  });

  it('should redact secrets at any depth', () => {
    const { logger, stubs } = createLoggerWithStubs();
    logger.debug('repos', [{ config: { github: { token: 'ghp_x' }, jenkins: { username: 'u', password: 'p' } } }]);
    const meta = stubs.debug.firstCall.args[1];
    meta.data[0].config.github.token.should.be.eql('[REDACTED]');
    meta.data[0].config.jenkins.password.should.be.eql('[REDACTED]');
    meta.data[0].config.jenkins.username.should.be.eql('u');
  });

  it('should log errors once', () => {
    const { logger, stubs } = createLoggerWithStubs();
    logger.error('test');
    stubs.error.calledOnce.should.be.ok();
    stubs.debug.called.should.not.be.ok();
  });
});
