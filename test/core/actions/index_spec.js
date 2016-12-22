'use strict';

require('should');

const actions = require('../../../core/actions');

describe('Actions builder', () => {
  context('Interface', () => {
    it('should have the "subscriberCheckersToEvents method"', () => {
      actions.subscribeCheckersToEvents.should.be.a.Function();
    });

    it('should have the "getPullRequestsDeployInfo method"', () => {
      actions.getPullRequestsDeployInfo.should.be.a.Function();
    });

    it('should have the "createRelease method"', () => {
      actions.createRelease.should.be.a.Function();
    });

    it('should have the "previewRelease method"', () => {
      actions.previewRelease.should.be.a.Function();
    });

    it('should have the "getReleaseNotes method"', () => {
      actions.getReleaseNotes.should.be.a.Function();
    });

  });
});
