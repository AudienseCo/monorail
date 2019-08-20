'use strict';

module.exports = module.exports = (config, deploysController) => {
  return () => {
    return {
      text: 'There is a deploy in progress.',
      color: 'danger'
    }
  }
};
