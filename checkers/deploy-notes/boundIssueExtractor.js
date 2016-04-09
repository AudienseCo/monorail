'use strict';

module.exports = function() {

  const that = {
    extract: function(text) {
      const regex = /Closes \#([0-9]+)/i;
      const match = text.match(regex);

      if (match) {
        return match[1];
      }
      else {
        const matchFixes = text.match(/Fixes \#([0-9]+)/i);
        if (matchFixes) {
          return matchFixes[1];
        }
      }
      return null;
    }
  };

  return that;
};
