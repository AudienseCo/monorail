'use strict';

require('should');
const logger = require('../../../lib/logger');

describe('Logger builder', () => {
  context('Interface', () => {
    it('should have the "error" method', () => {
      logger.error.should.be.a.Function();
    });
    it('should have the "info" method', () => {
      logger.info.should.be.a.Function();
    });
    it('should have the "debug" method', () => {
      logger.debug.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should call the logger succesfully', () => {
      logger.error('test', { a: 'b'}, [1,2,3]);
    });
  });

});
