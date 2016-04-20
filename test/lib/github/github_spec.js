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
      github.getIssueLabels(1234, (err, labels) => {
        labels.should.be.eql(['tag1', 'tag2']);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'socialbro',
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
        target_url: 'htttp://foo/bar'
      };
      const spy = sinon.spy(githubApiDummy.statuses, 'create');
      github.updateCommitStatus(status, (err, result) => {
        result.context.should.be.eql('test');
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'socialbro',
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
      github.getPullRequest(1234, (err, result) => {
        result.number.should.be.eql(1234);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'socialbro',
          number: 1234
        }).should.be.ok();
        done();
      });
    });

    it('should get an issue info', done => {
      const githubApiDummy = createGithubDummy({ number: 1234 });
      const github = createGithub(githubApiDummy, config);
      const spy = sinon.spy(githubApiDummy.issues, 'getRepoIssue');
      github.getIssue(1234, (err, result) => {
        result.number.should.be.eql(1234);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'socialbro',
          number: 1234
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
        body: 'Release body'
      };

      github.createRelease(releaseInfo, (err, result) => {
        result.id.should.be.eql(1234);
        spy.calledWith({
          user: 'AudienseCo',
          repo: 'socialbro',
          tag_name: 'v1.2.3',
          name: 'Release',
          body: 'Release body'
        }).should.be.ok();
        done();
      });
    });

  });
});
