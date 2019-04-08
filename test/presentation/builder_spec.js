'use strict';

require('should');
const presentation = require('../../presentation')();


describe('Presentation layer builder', () => {
  context('Interface', () => {
    it('should be an object', () => {
      presentation.should.be.a.Object();
    });
    it('should have a preview function', () => {
      presentation.preview.should.be.a.Function();
    });
    it('should have a release function', () => {
      presentation.release.should.be.a.Function();
    });
  });
});
