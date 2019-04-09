'use strict';

module.exports = (clock) => {
  return () => {
    const date = clock
      .toISOString()
      .replace(/\-/g, '.')
      .replace(/\:/g, '.');
    return `v${date}`;
  };
};
