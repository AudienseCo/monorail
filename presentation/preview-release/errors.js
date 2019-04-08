'use strict';

// TODO: take the minutes from config

module.exports = {
  NO_CHANGES: {
    text: 'Monorail will not deploy anything in the next 10 minutes as there have not been changes since the last deploy.',
    color: '#439FE0'
  },
  DEPLOY_NOTES: {
    text: 'Monorail will not deploy anything in the next 10 minutes as there is a pull request with deploy notes label added.',
    color: 'danger'
  },
  NO_SERVICES: {
    text: 'Monorail will not deploy anything in the next 10 minutes because there is no pull request linked to services to deploy.',
    color: 'warning'
  },
  UNkNOWN_ERROR: {
    text: 'Unhandled error. Monorail will not deploy anything in the next 10 minutes.',
    color: 'danger'
  }
};
