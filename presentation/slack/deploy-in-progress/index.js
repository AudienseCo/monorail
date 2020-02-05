'use strict';

module.exports = (config) => {
  return () => {
    return {
      attachments: [
        {
          text: ':no_entry: There is a deploy in progress.',
          color: 'danger'
        }
      ]
    }
  }
};
