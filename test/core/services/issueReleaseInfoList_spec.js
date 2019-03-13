'use strict';

require('should');
const issueReleaseInfoListBuilder = require('../../../core/services/issueReleaseInfoList');

describe('issueReleaseInfoList service', () => {

  it('should get the issue release info for a list of ids', done => {
    const ids = [1, 2, 3];
    const expected = [
      { issue: { number: 1 } },
      { issue: { number: 2 } },
      { issue: { number: 3 } }
    ];
    const repo = 'socialbro';

    const issueReleaseInfoFake = _createIssueReleaseInfoFake();
    const issueReleaseInfoList = issueReleaseInfoListBuilder(issueReleaseInfoFake);
    issueReleaseInfoList.get(repo, ids, (error, list) => {
      list.should.be.eql(expected);
      done();
    });
  });

  function _createIssueReleaseInfoFake() {
    return {
      getInfo: (repo, id, callback) => callback(null, { issue: { number: id } })
    };
  }
});
