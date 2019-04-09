'use strict';

module.exports = (clock) => {
  return () => {
    return clock.toISOString();
  };
};
