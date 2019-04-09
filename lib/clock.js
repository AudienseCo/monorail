'use strict';

module.exports = () => {
  return {
    now: () => Date.now(),
    toISOString: () => new Date().toISOString()
  };
};
