'use scrict';

require('should');
const createGetReleaseTag = require('../../../core/services/getReleaseTag');

describe('getReleaseTag service', () => {
  it('should get the release tag a an ISO date of now', () => {
    const clockDummy = createClockDummy(new Date('05 October 2011 14:48 UTC'));
    const getReleaseTag = createGetReleaseTag(clockDummy);
    const tag = getReleaseTag();
    tag.should.be.eql('v2011.10.05T14.48.00.000Z');
  });

  function createClockDummy(date) {
    return {
      toISOString: () => new Date(date).toISOString()
    };
  }

});
