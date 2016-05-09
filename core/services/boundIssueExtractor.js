'use strict';

module.exports = function() {

  const that = {
    extract: function(text) {
      const keywords = [
        'close',
        'closes',
        'closed',
        'fix',
        'fixes',
        'fixed',
        'resolve',
        'resolves',
        'resolved'
      ];

      for (const keyword of keywords) {
        const regexTemplate = `${keyword} \#([0-9]+)`;
        const regex = new RegExp(regexTemplate, 'i');
        const match = text.match(regex);

        if (match) {
          return match[1];
        }
      }
      return null;
    }
  };

  return that;
};
