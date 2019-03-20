'use strict';

const should = require('should');
const createPreviewRelease = require('../../../core/actions/previewRelease');
const createBoundIssueExtractor = require('../../../core/services/boundIssueExtractor');
const boundIssueExtractor = createBoundIssueExtractor();

describe('previewRelease action', () => {

  context('Interface', () => {
    const previewRelease = createPreviewRelease();

    it('should should be a function', () => {
      previewRelease.should.be.a.Function();
    });

  });

  context('Behaviour', () => {

    function createGithubDummy(prInfo, issueInfo) {
      return {
        getPullRequest: (repo, id, cb) => {
          cb(null, prInfo);
        },
        getIssue: (repo, id, cb) => {
          cb(null, issueInfo);
        }
      };
    }

    it('should return the list of affected issues from a list of pull requests', done => {
      const prInfo = { title: 'Foo PR', body: 'Closes #4321' };
      const issueInfo = { number: 4321, title: 'Bar issue' };
      const githubDummy = createGithubDummy(prInfo, issueInfo);
      const previewRelease = createPreviewRelease(githubDummy, boundIssueExtractor);
      const pullRequestList = ['1234'];
      const repo = 'socialbro';
      const expected = [
        {
          number: 4321,
          title: 'Bar issue'
        }
      ];

      previewRelease(repo, pullRequestList, (err, issues) => {
        should.not.exist(err);
        issues.should.be.eql(expected);
        done();
      });
    });
  });
});
