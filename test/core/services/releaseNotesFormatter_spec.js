'use strict';

const releaseNotesFormatter = require('../../../core/services/releaseNotesFormatter')();

describe('releaseNotesFormatter service', () => {

  it('should create a text with a list of relaseInfo data', () => {
    const relaseInfoList = [
      {
        issue: { number: 1, title: 'Foo issue' },
        participants: []
      },
      {
        issue: { number: 2, title: 'Bar issue' },
        participants: []
      }
    ];
    const expected = '#1 Foo issue\n#2 Bar issue';

    releaseNotesFormatter.format(relaseInfoList).should.be.eql(expected);
  });

  it('should include the participants if there is any', () => {
    const relaseInfoList = [
      {
        issue: { number: 1, title: 'Foo issue' },
        participants: ['Ana', 'Carlos']
      },
      {
        issue: { number: 2, title: 'Bar issue' },
        participants: []
      }
    ];
    const expected = '#1 Foo issue. cc @Ana, @Carlos\n#2 Bar issue';

    releaseNotesFormatter.format(relaseInfoList).should.be.eql(expected);
  });
});
