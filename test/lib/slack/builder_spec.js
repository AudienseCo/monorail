'use strict';

require('should');
const slack = require('../../../lib/slack');

describe('Slack builder', () => {
  context('Interface', () => {
    it('should have the "send" method', () => {
      slack.send.should.be.a.Function();
    });
  });
});
