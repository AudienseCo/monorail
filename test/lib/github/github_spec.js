'use strict';

require('should');
const sinon = require('sinon');
const createGithub = require('../../../lib/github/github');

describe('Github API wrapper', () => {

  context('Interface', () => {
    const github = createGithub({ authenticate: () => {}}, {});
    it('should have the "getIssueLabels" method', () => {
      github.getIssueLabels.should.be.a.Function();
    });

    it('should have the "updateCommitStatus" method', () => {
      github.updateCommitStatus.should.be.a.Function();
    });

    it('should have the "getPullRequest" method', () => {
      github.getPullRequest.should.be.a.Function();
    });

    it('should have the "getIssue" method', () => {
      github.getIssue.should.be.a.Function();
    });

    it('should have the "createRelease" method', () => {
      github.createRelease.should.be.a.Function();
    });

    it('should have the "getIssueComments" method', () => {
      github.getIssueComments.should.be.a.Function();
    });

    it('should have the "addIssueLabels" method', () => {
      github.addIssueLabels.should.be.a.Function();
    });

    it('should have the "compareCommits" method', () => {
      github.compareCommits.should.be.a.Function();
    });

    it('should have the "createBranch" method', () => {
      github.createBranch.should.be.a.Function();
    });

    it('should have the "getBranch" method', () => {
      github.getBranch.should.be.a.Function();
    });

    it('should have the "removeBranch" method', () => {
      github.removeBranch.should.be.a.Function();
    });

    it('should have the "removeTag" method', () => {
      github.removeTag.should.be.a.Function();
    });

    it('should have the "merge" method', () => {
      github.merge.should.be.a.Function();
    });

  });

  context('Behaviour', () => {

    function createGithubDummy(result) {
      return {
        authenticate: () => {},
        issues: {
          getIssueLabels: (issue, cb) => {
            cb(null, result);
          },
          getRepoIssue: (number, cb) => {
            cb(null, result);
          },
          getComments: (number, cb) => {
            cb(null, result);
          },
          edit: (options, cb) => {
            cb(null, result);
          }
        },
        statuses: {
          create: (options, cb) => {
            cb(null, result);
          }
        },
        pullRequests: {
          get: (number, cb) => {
            cb(null, result);
          }
        },
        releases: {
          createRelease: (info, cb) => {
            cb(null, result);
          }
        },
        repos: {
          compareCommits: (info, cb) => {
            cb(null, result);
          },
          merge: (info, cb) => {
            cb(null, result);
          },
          getContent: (info, cb) => {
            cb(null, result);
          }
        },
        gitdata: {
          getReference: (info, cb) => {
            cb(null, result);
          },
          createReference: (info, cb) => {
            cb(null, result);
          },
          deleteReference: (info, cb) => {
            cb(null, result);
          }
        }
      };
    }

    const config = {
      repo: 'socialbro',
      user: 'AudienseCo'
    };

    it('should get the labels for a specified issue', done => {
      const githubApiDummy = createGithubDummy(['tag1', 'tag2']);
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.issues, 'getIssueLabels');
      const repo = 'another'
      github.getIssueLabels(repo, 1234, (err, labels) => {
        labels.should.be.eql(['tag1', 'tag2']);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          number: 1234
        }).should.be.ok();
        done();
      });
    });

    it('should change the status for a commit', done => {
      const githubApiDummy = createGithubDummy({ context: 'test' });
      const github = createGithub(githubApiDummy, config);
      const status = {
        sha: 'dummysha',
        state: 'success',
        context: 'test',
        description: 'A dummy description for the state',
        target_url: 'htttp://foo/bar',
        repo: 'another'
      };
      const spy = sinon.spy(githubApiDummy.statuses, 'create');
      github.updateCommitStatus(status, (err, result) => {
        result.context.should.be.eql('test');
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          sha: 'dummysha',
          state: 'success',
          context: 'test',
          description: 'A dummy description for the state',
          target_url: 'htttp://foo/bar'

        }).should.be.ok();
        done();
      });
    });

    it('should get a pull request info', done => {
      const githubApiDummy = createGithubDummy({ number: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.pullRequests, 'get');
      const repo = 'another';
      github.getPullRequest(repo, 1234, (err, result) => {
        result.number.should.be.eql(1234);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          number: 1234
        }).should.be.ok();
        done();
      });
    });

    it('should get an issue info', done => {
      const githubApiDummy = createGithubDummy({ number: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.issues, 'getRepoIssue');
      const repo = 'another';
      github.getIssue(repo, 1234, (err, result) => {
        result.number.should.be.eql(1234);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          number: 1234
        }).should.be.ok();
        done();
      });
    });

    it('should get the comments for an issue', done => {
      const githubApiDummy = createGithubDummy([{ id: 1234 }]);
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.issues, 'getComments');
      const repo = 'another';
      github.getIssueComments(repo, 1234, (err, result) => {
        result.length.should.be.eql(1);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          number: 1234,
          per_page: 100
        }).should.be.ok();
        done();
      });
    });

    it('should add labels to an issue', done => {
      const githubApiDummy = createGithubDummy([{ name: 'foo' }]);
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.issues, 'edit');
      const repo = 'another';
      github.addIssueLabels(repo, 1234, ['foo'], (err, result) => {
        result.length.should.be.eql(1);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          number: 1234,
          labels: ['foo']
        }).should.be.ok();
        done();
      });
    });

    it('create a release', done => {
      const githubApiDummy = createGithubDummy({ id: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.releases, 'createRelease');
      const releaseInfo = {
        tag_name: 'v1.2.3',
        name: 'Release',
        body: 'Release body',
        repo: 'another'
      };

      github.createRelease(releaseInfo, (err, result) => {
        result.id.should.be.eql(1234);
        spy.calledWith({
          owner: 'AudienseCo',
          user: 'AudienseCo',
          repo: 'another',
          tag_name: 'v1.2.3',
          name: 'Release',
          body: 'Release body'
        }).should.be.ok();
        done();
      });
    });

    it('get changes', done => {
      const githubApiDummy = createGithubDummy({ id: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.repos, 'compareCommits');
      const msg  = {
        repo: 'another',
        base: 'master',
        head: 'dev'
      };
      github.compareCommits(msg, (err, result) => {
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          base: 'master',
          head: 'dev'
        }).should.be.ok();
        done();
      });
    });

    it('create branch', done => {
      const githubApiDummy = createGithubDummy({ id: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.gitdata, 'createReference');

      const repo = 'another';
      const branch = 'master';
      const sha = '123';
      github.createBranch(repo, branch, sha, (err, result) => {
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          ref: 'refs/heads/master',
          sha: '123'
        }).should.be.ok();
        done();
      });
    });

    it('get branch', done => {
      const githubApiDummy = createGithubDummy({ id: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.gitdata, 'getReference');

      const repo = 'another';
      const branch = 'master';
      github.getBranch(repo, branch, (err, result) => {
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          ref: 'heads/master',
        }).should.be.ok();
        done();
      });
    });

    it('remove branch', done => {
      const githubApiDummy = createGithubDummy({ id: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.gitdata, 'deleteReference');

      const repo = 'another';
      const branch = 'master';
      github.removeBranch(repo, branch, (err, result) => {
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          ref: 'heads/master',
        }).should.be.ok();
        done();
      });
    });

    it('remove tag', done => {
      const githubApiDummy = createGithubDummy({ id: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.gitdata, 'deleteReference');

      const repo = 'another';
      const tag = '1.5';
      github.removeTag(repo, tag, (err, result) => {
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          ref: 'tags/1.5'
        }).should.be.ok();
        done();
      });
    });

    it('merge branch', done => {
      const githubApiDummy = createGithubDummy({ id: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.repos, 'merge');

      const repo = 'another';
      const base = 'master';
      const head = 'deploy-123';
      github.merge(repo, base, head, (err, result) => {
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          base: 'master',
          head: 'deploy-123'
        }).should.be.ok();
        done();
      });
    });

    it('get content', done => {
      const githubApiDummy = createGithubDummy({ id: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.repos, 'getContent');

      const repo = 'another';
      const path = '.monorail';
      const head = 'deploy-123';
      github.getContent(repo, path, (err, result) => {
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'another',
          path: '.monorail',
        }).should.be.ok();
        done();
      });
    });

  });
});
