'use strict';

require('should');
const codeBuild = require('../../../../lib/ciDrivers/codeBuild');

describe('CodeBuild CI driver builder', () => {
  context('Interface', () => {
    it('should be a function', () => {
      codeBuild.should.be.a.Function();
    });
  });
});
