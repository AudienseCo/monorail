'use strict';

const should = require('should');
const sinon  = require('sinon');

const createDeployNotesChecker = (boundIssueExtractor, github) => {
  let that = {};

  that.checkPullRequest = (prInfo, cb) => {
    const boundIssue = boundIssueExtractor.extract(prInfo);

    if (boundIssue) {
      github.getIssueLabels(boundIssue, (err, labels) => {
        if (err) return cb(err);

        const hasDeployNotes = labels.some(label => label.toLowerCase() === 'deploy notes');
        if (hasDeployNotes) {
          cb(null, {
            state: 'failure',
            context: 'Deploy Notes'
          });
        }
        else cb(null, {
          state: 'success',
          context: 'Deploy Notes'
        });
      });
    }
    else cb(null, {
      state: 'success',
      context: 'Deploy Notes'
    });
  };

  return that;
};

describe('Deploy notes checker', () => {
  function createBoundIssueExtractorDummy(result) {
    return {
      extract: (body) => {
        return result;
      }
    };
  }

  function createGithubDummy(result) {
    return {
      getIssueLabels: (issue, cb) => {
        cb(null, result);
      }
    };
  }
  context('Interface', () => {
    const deployNotes = createDeployNotesChecker();
    it('should have the "check" method', () => {
      deployNotes.checkPullRequest.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    it('should return an error status if the bound issue has the deploy tag added', done => {
      const boundIssueExtractorDummy = createBoundIssueExtractorDummy('1234');
      const githubDummy = createGithubDummy(['Deploy Notes']);

      const deployNotes = createDeployNotesChecker(boundIssueExtractorDummy, githubDummy);
      deployNotes.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Deploy Notes');
        status.state.should.be.eql('failure');
        done();
      });
    });

    it('should return a success status if none issue has the deploy tag added', done => {
      const boundIssueExtractorDummy = createBoundIssueExtractorDummy('1234');
      const githubDummy = createGithubDummy([]);

      const deployNotes = createDeployNotesChecker(boundIssueExtractorDummy, githubDummy);
      deployNotes.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Deploy Notes');
        status.state.should.be.eql('success');
        done();
      });
    });

    it('should return a success status if the PR has not any issue bound', done => {
      const boundIssueExtractorDummy = createBoundIssueExtractorDummy();
      const githubDummy = createGithubDummy([]);

      const deployNotes = createDeployNotesChecker(boundIssueExtractorDummy, githubDummy);
      deployNotes.checkPullRequest({ body: '#1234' }, (err, status) => {
        status.context.should.be.eql('Deploy Notes');
        status.state.should.be.eql('success');
        done();
      });
    });
  });
});

describe('Bound Issue Extractor', () => {
  const boundIssueExtractor = {
    extract: function(text) {
      const regex = /Closes \#([0-9]+)/i;
      const match = text.match(regex);

      if (match) {
        return match[1];
      }
      else {
        const matchFixes = text.match(/Fixes \#([0-9]+)/i);
        if (matchFixes) {
          return matchFixes[1];
        }
      }
      return null;
    }
  };

  context('Interface', () => {
    it('should have the "extract" method', () => {
      boundIssueExtractor.extract.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should return null if the input string is empty', () => {
      should.not.exist(boundIssueExtractor.extract(''));
    });

    it('should return the issue number (Closes #issue)', () => {
      const input = 'Closes #1234';
      boundIssueExtractor.extract(input).should.be.eql('1234');
    });

    it('should return the issue number (Fixes #issue)', () => {
      const input = 'Fixes #1234';
      boundIssueExtractor.extract(input).should.be.eql('1234');
    });

    it('should find the issue in the middle of the text', () => {
      const input = 'This is a dummy text\nFixes #1234\nThis is a dummy text';
      boundIssueExtractor.extract(input).should.be.eql('1234');
    });

    it('should find the issue if it is concated with punctuation marks', () => {
      const input = 'This is a dummy text\nFixes #1234.\nThis is a dummy text';
      boundIssueExtractor.extract(input).should.be.eql('1234');
    });

    it('should not return any issue ("Fixes any text #1234")', () => {
      const input = 'Fixes any text #1234';
      should.not.exist(boundIssueExtractor.extract(input));
    });

  });
});

function createGithub(githubApi, config) {
  var that = {};

  that.getIssueLabels = (issue, cb) => {
    githubApi.issues.getIssueLabels(buildMsg({number: issue}), (err, labels) => {
      cb(err, labels);
    });
  };

  that.updateCommitStatus = (options, cb) => {
    const msg = buildMsg(options);
    githubApi.statuses.create(msg, cb);
  };

  function buildMsg(options) {
    const defaults = {
      user: config.user,
      repo: config.repo
    };
    return Object.assign({}, defaults, options);
  }

  return that;
}

describe('Github API wrapper', () => {

  context('Interface', () => {
    const github = createGithub();
    it('should have the "getIssueLabels" method', () => {
      github.getIssueLabels.should.be.a.Function();
    });

    it('should have the "updateCommitStatus" method', () => {
      github.updateCommitStatus.should.be.a.Function();
    });
  });

  context('Behaviour', () => {

    function createGithubDummy(result) {
      return {
        issues: {
          getIssueLabels: (issue, cb) => {
            cb(null, result);
          }
        },
        statuses: {
          create: (options, cb) => {
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

  });
});

function createDeployNotesService(deployNotesChecker, github) {
  let that = {};

  that.updatePullRequestCommit = (prInfo, cb) => {
    deployNotesChecker.checkPullRequest(prInfo, (err, status) => {
      github.updateCommitStatus(status, (err, result) => {
        if (err) console.log('Update commit state error', err);
        else console.log(`Updated commit state: sha="${status.sha}"
          state="${status.state}"`);
      });
    });
  };

  return that;
}

describe('Deploy notes service', () => {
  const deployNotesService = createDeployNotesService();

  context('Interface', () => {
    it('should have the "updatePullRequestCommit" method', () => {
      deployNotesService.updatePullRequestCommit.should.be.a.Function();
    });
  });
});

const EventEmitter = require('events');

function createDeployNotesSubscriber(emitter, deployNotesService) {
  let that = {
    subscribe: () => {
      emitter.on('pull_request', payload => {
        if (payload.action === 'opened') {
          const prInfo = payload.pull_request;
          deployNotesService.updatePullRequestCommit(prInfo);
        }
      });

      emitter.on('issue_comment', payload => {
        if (payload.action === 'created' && payload.issue && payload.issue.pull_request) {
          if (payload.comment.body.toLowerCase() === 'check deploy notes please') {
            const prInfo = payload.issue;
            deployNotesService.updatePullRequestCommit(prInfo);
          }
        }
      });
    }
  };
  return that;
}

describe('Deploy notes subscriber', () => {
  function createDeployNotesCheckerDummy(result) {
    return {
      checkPullRequest: (prInfo, cb) => {
        cb(null, result);
      }
    };
  }

  function createGithubDummy(result) {
    return {
      updateCommitStatus: (status, cb) => {
        cb(null, result);
      }
    };
  }

  context('Interface', () => {
    const deployNotesSubscriber = createDeployNotesSubscriber();
    it('should have the "subscribe" method', () => {
      deployNotesSubscriber.subscribe.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should subscribe to the "pull_request" event', done => {
      const emitter = new EventEmitter();
      var spy = sinon.spy(emitter, 'on');
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter);
      deployNotesSubscriber.subscribe();
      spy.calledWith('pull_request').should.be.ok();
      done();
    });

    it('should subscribe to the "issue_comment" event', done => {
      const emitter = new EventEmitter();
      var spy = sinon.spy(emitter, 'on');
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter);
      deployNotesSubscriber.subscribe();
      spy.calledWith('issue_comment').should.be.ok();
      done();
    });

    it('should call the deploy notes checker on new pull requests', done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'opened',
        number: 1234,
        pull_request: {}
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it('should not call the deploy notes service on close a pull request', done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'closed',
        number: 1234,
        pull_request: {}
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('pull_request', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });

    it(`should call the deploy notes service when a user comment "check
    deploy notes please"`, done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'check deploy notes please'
        }
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it(`should call the deploy notes service when a user comment "check deploy
    notes please" (case insensitive)`, done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'Check deploy notes please'
        }
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.be.ok();
      done();
    });

    it('should not call the deploy notes service when a user write any comment on the PR', done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
          pull_request: {}
        },
        comment: {
          body: 'Dummy text comment'
        }
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });

    it('should not call the deploy notes service for a comment on an issue', done => {
      const emitter = new EventEmitter();
      const deployNotesCheckerDummy = createDeployNotesCheckerDummy({});
      const githubDummy = createGithubDummy({});
      const deployNotesService = createDeployNotesService(deployNotesCheckerDummy, githubDummy);
      const deployNotesSubscriber = createDeployNotesSubscriber(emitter, deployNotesService);
      const spy = sinon.spy(deployNotesService, 'updatePullRequestCommit');
      const payload = {
        action: 'created',
        issue: {
        },
        comment: {
          body: 'check deploy notes please'
        }
      };
      deployNotesSubscriber.subscribe();
      emitter.emit('issue_comment', payload);
      spy.calledOnce.should.not.be.ok();
      done();
    });
  });
});
