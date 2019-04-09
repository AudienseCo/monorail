'use strict';

require('should');
const clock = require('../../lib/clock')();

console.log(clock)

describe('Clock', () => {
  context('Interface', () => {
    it('should have the "now" method', () => {
      clock.now.should.be.a.Function();
    });
    it('should have the "toISOString" method', () => {
      clock.toISOString.should.be.a.Function();
    });
  });
});
