'use strict';

require('should');
const jenkins = require('../../../../lib/ciDrivers/jenkins');

describe('jenkins CI driver builder', () => {
  context('Interface', () => {
    it('should be a function', () => {
      jenkins.should.be.a.Function();
    });
  });
});
