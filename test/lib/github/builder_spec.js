'use strict';

require('should');
const github = require('../../../lib/github');

describe('Github builder', () => {
  context('Interface', () => {
    it('should have the "getIssueLabels" method', () => {
      github.getIssueLabels.should.be.a.Function();
    });

    it('should have the "updateCommitStatus" method', () => {
      github.updateCommitStatus.should.be.a.Function();
    });
  });
});
