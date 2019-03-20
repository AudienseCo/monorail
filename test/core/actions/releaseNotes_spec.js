'use strict';

require('should');

const getReleaseNotesBuilder = require('../../../core/actions/getReleaseNotes');
const releaseNotesFormatterBuilder = require('../../../core/services/releaseNotesFormatter');

describe('Get release notes', () => {

  it('should return all the releaase notes', done => {
    const ids = ['1234', '4321'];
    const filterLabels = [];
    const expected = '#1234 Bar issue\n#4321 Foo issue';
    const repo = 'socialbro';

    const issueReleaseInfoListFake = _createIssueReleaseInfoListFake();
    const releaseNotesFormatter = releaseNotesFormatterBuilder();
    const getReleaseNotes = getReleaseNotesBuilder(issueReleaseInfoListFake, releaseNotesFormatter);
    getReleaseNotes(repo, ids, filterLabels, (error, notes) => {
      notes.should.be.eql(expected);
      done();
    });
  });

  it('should return just the releaase notes filtered by label', done => {
    const ids = ['1234', '4321'];
    const filterLabels = ['notify:staff'];
    const expected = '#1234 Bar issue';
    const repo = 'socialbro';

    const issueReleaseInfoListFake = _createIssueReleaseInfoListFake();
    const releaseNotesFormatter = releaseNotesFormatterBuilder();
    const getReleaseNotes = getReleaseNotesBuilder(issueReleaseInfoListFake, releaseNotesFormatter);
    getReleaseNotes(repo,ids, filterLabels, (error, notes) => {
      notes.should.be.eql(expected);
      done();
    });
  });

  it('should return empty if there is not any match', done => {
    const ids = ['1234', '4321'];
    const filterLabels = ['notify:unexisting'];
    const expected = '';
    const repo = 'socialbro';

    const issueReleaseInfoListFake = _createIssueReleaseInfoListFake();
    const releaseNotesFormatter = releaseNotesFormatterBuilder();
    const getReleaseNotes = getReleaseNotesBuilder(issueReleaseInfoListFake, releaseNotesFormatter);
    getReleaseNotes(repo, ids, filterLabels, (error, notes) => {
      notes.should.be.eql(expected);
      done();
    });
  });

  function _createIssueReleaseInfoListFake() {
    return {
      get: (repo, ids, next) => {
        const releaseInfo = [
          {
            issue: {
              number: '1234',
              title: 'Bar issue',
              labels: [
                {
                  name: 'notify:staff'
                }
              ]
            },
            participants: []
          },
          {
            issue: { number: '4321', title: 'Foo issue', labels: [] },
            participants: []
          }
        ];
        next(null, releaseInfo);
      }
    };
  }
});
