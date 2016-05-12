'use strict';

require('should');
const sinon = require('sinon');

const createReleaseInfoLabel = require('../../../core/services/releaseInfoLabel');

describe('releaseInfoLabel service', () => {

  context('Interface', () => {
    const releaseInfoLabel = createReleaseInfoLabel();
    it('should have the "addLabels" method', () => {
      releaseInfoLabel.addLabels.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    function createGithubDummy(result) {
      return {
        addIssueLabels: (issueNumber, labels, cb) => {
          cb(null, result);
        }
      };
    }

    it('should add labels for an issue', done => {
      const githubDummy = createGithubDummy();
      const releaseInfoLabel = createReleaseInfoLabel(githubDummy);
      const spy = sinon.spy(githubDummy, 'addIssueLabels');
      releaseInfoLabel.addLabels([{ issue: { number: 1234 }}], ['foo', 'bar'], err => {
        spy.calledOnce.should.be.ok();
        done();
      });
    });

    it('should add labels for a release info list', done => {
      const githubDummy = createGithubDummy();
      const releaseInfoLabel = createReleaseInfoLabel(githubDummy);
      const spy = sinon.spy(githubDummy, 'addIssueLabels');
      const releaseInfo = [{ issue: { number: 1234 } }, { issue: { number: 4321 }}];
      releaseInfoLabel.addLabels(releaseInfo, ['foo', 'bar'], err => {
        spy.callCount.should.be.eql(2);
        done();
      });
    });

    it('should keep the current issue labels', done => {
      const githubDummy = createGithubDummy();
      const releaseInfoLabel = createReleaseInfoLabel(githubDummy);
      const spy = sinon.spy(githubDummy, 'addIssueLabels');
      const releaseInfo = [
        {
          issue: {
            number: 1234,
            labels: [{ name: 'foo' }]
          }
        }
      ];
      releaseInfoLabel.addLabels(releaseInfo, ['bar'], err => {
        spy.calledWith(1234, ['foo', 'bar']).should.be.ok();
        done();
      });
    });

  });
});
