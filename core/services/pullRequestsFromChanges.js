'use strict';

module.exports = (github) => {
  return (cb) => {
    const compareInfo  = {
      base: 'master',
      head: 'dev'
    };
    github.compareCommits(compareInfo, (err, result) => {
      if (err) return cb(err);
      const ids = result.commits.reduce(idFromMergedPullRequests, []);
      cb(null, ids);
    });
  };

  function idFromMergedPullRequests(ids, commitInfo) {
    const id = parsePullRequestId(commitInfo.commit.message);
    if (id) ids.push(id);
    return ids;
  }

  function parsePullRequestId(message) {
    const r = /^Merge pull request #(\d*)/;
    const matches = r.exec(message);
    if (matches && matches.length > 0) return matches[1];
  }
};
