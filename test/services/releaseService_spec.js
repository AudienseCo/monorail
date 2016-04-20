'use strict';

require('should');
const sinon  = require('sinon');
const createReleaseService = require('../../services/releaseService');

describe('Create release service', () => {
  context('Interface', () => {

    const releaseService = createReleaseService();

    it('should have the "create" method', () => {
      releaseService.create.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    function createGithubDummy(response) {
      return {
        createRelease: (info, cb) => {
          cb();
        }
      };
    }

    it('should compound the github request correctly', (done) => {
      const githubDummy = createGithubDummy();
      const spy = sinon.spy(githubDummy, 'createRelease');
      const releaseService = createReleaseService(githubDummy);
      const tag = 'v1.3.0';
      const issues = [
        {
          number: 1234,
          title: 'Foo issue'
        },
        {
          number: 4321,
          title: 'Bar issue'
        }
      ];
      releaseService.create(tag, issues, (err, result) => {
        spy.calledWith({
          tag_name: 'v1.3.0',
          name: 'v1.3.0 Release',
          body: '#1234 Foo issue\n#4321 Bar issue'
        }).should.be.ok();
        done();
      });
    });
  });
});
