'use strict';

module.exports = {
  NO_CHANGES: {
    text: 'Monorail will not deploy anything because there is no pull request linked to services to deploy.',
    color: '#439FE0'
  },
  DEPLOY_NOTES: {
    text: 'Monorail will not deploy anything as there is one pull request with deploy notes label added.',
    color: 'danger'
  },
  NO_SERVICES: {
    text: 'Monorail will not deploy anything because the list of services is empty.',
    color: 'warning'
  },
  UNkNOWN_ERROR: {
    text: 'Unhandled error. Monorail will not deploy anything.',
    color: 'danger'
  }
};
