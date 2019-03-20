'use strict';

module.exports = {
  NO_CHANGES: {
    text: 'Monorail will not deploy anything in the next 10 minutes as there are no changes to deploy.',
    color: '#439FE0'
  },
  DEPLOY_NOTES: {
    text: 'Monorail will not deploy anything in the next 10 minutes as there are deployNotes.',
    color: 'danger'
  },
  NO_SERVICES: {
    text: 'Monorail will not deploy anything in the next 10 minutes because the list of services is empty.',
    color: 'warning'
  },
  UNkNOWN_ERROR: {
    text: 'Unhandled error. Monorail will not deploy anything in the next 10 minutes.',
    color: 'danger'
  }
};
