'use strict';

require('should');
const sinon = require('sinon');
const createLogger = require('../../../lib/logger/logger');

describe('Logger wrapper', () => {
  it('should call the logger with the same parameters', () => {
    const settings = {};
    const debugStub = sinon.stub();
    const createLoggerStub = () => {
      return {
        debug: debugStub
      };
    };

    const logger = createLogger(settings, createLoggerStub);
    logger.debug('test', { a: '123' }, [ 1, 2, 4]);
    debugStub.withArgs('test', { a: '123' }, [ 1, 2, 4]).calledOnce.should.be.ok();
  });
});
