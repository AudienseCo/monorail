'use strict';

const should = require('should');
const createPullRequestsFromChanges = require('../../../core/services/pullRequestsFromChanges');

describe('Get pull requests ids from changes', () => {
  context('Interface', () => {

    const pullRequestsFromChanges = createPullRequestsFromChanges({}, {});

    it('should be a method', () => {
      pullRequestsFromChanges.should.be.a.Function();
    });

  });

  context('Behaviour', () => {

    const configDummy = {
      masterBranch: 'master',
      devBranch: 'dev'
    };

    function createGithubDummy(response) {
      return {
        compareCommits: (info, cb) => {
          cb(null, response);
        }
      };
    }

    function createGithubDummyWithError(error) {
      return {
        compareCommits: (info, cb) => {
          cb(error);
        }
      };
    }

    it('should return an error if the fetching fails', (done) => {
      const githubDummy = createGithubDummyWithError('foo_error');
      const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy, configDummy);
      const repo = 'socialbro';
      pullRequestsFromChanges({ repo }, (err, ids) => {
        err.should.be.eql('foo_error');
        should.not.exist(ids);
        done();
      });
    });

    it('should get ids from merged pull requests', (done) => {
      const githubDummy = createGithubDummy({
        commits: [
          {
            commit: {
              message: 'Merge pull request #10499 from AudienseCo/public_api_update_production_openapi_definition\n\nAdd 403 status code response to report creation'
            }
          },
          {
            commit: {
              message: 'Another PR'
            }
          }
        ]
      });
      const pullRequestsFromChanges = createPullRequestsFromChanges(githubDummy, configDummy);
      const repo = 'socialbro';
      pullRequestsFromChanges({ repo }, (err, ids) => {
        should.not.exist(err);
        ids.should.be.eql(['10499']);
        done();
      });
    });
  });
});
