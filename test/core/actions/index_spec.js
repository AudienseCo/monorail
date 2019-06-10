'use strict';

require('should');

const actions = require('../../../core/actions');

describe('Actions builder', () => {
  context('Interface', () => {
    it('should have the "subscriberCheckersToEvents method"', () => {
      actions.subscribeCheckersToEvents.should.be.a.Function();
    });

    it('should have the "slackPreviewRelease method"', () => {
      actions.slackPreviewRelease.should.be.a.Function();
    });

    it('should have the "startDEploy method"', () => {
      actions.startDeploy.should.be.a.Function();
    });

  });
});
