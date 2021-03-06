'use strict';

module.exports = {
  NO_CHANGES: {
    text: 'Monorail didn\'t deploy anything as there are no changes since the last deploy.',
    color: '#439FE0'
  },
  DEPLOY_NOTES: {
    text: 'Monorail didn\'t deploy anything as there is one pull request with deploy notes label added.',
    color: 'danger'
  },
  NO_SERVICES: {
    text: 'Monorail didn\'t deploy anything because there is no pull request linked to services to deploy.',
    color: 'warning'
  },
  UNkNOWN_ERROR: {
    text: 'Unhandled error. Monorail didn\'t deploy anything.',
    color: 'danger'
  }
};
