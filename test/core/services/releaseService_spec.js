'use strict';

require('should');
const sinon  = require('sinon');
const createReleaseService = require('../../../core/services/releaseService');

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
      const info = [
        {
          issue: {
            number: 1234,
            title: 'Foo issue'
          },
          participants: []
        },
        {
          issue: {
            number: 4321,
            title: 'Bar issue'
          },
          participants: ['ana']
        }
      ];
      releaseService.create(tag, info, (err, result) => {
        spy.calledWith({
          tag_name: 'v1.3.0',
          name: 'v1.3.0 Release',
          body: '#1234 Foo issue\n#4321 Bar issue. cc ana'
        }).should.be.ok();
        done();
      });
    });
  });
});
