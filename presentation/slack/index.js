'use strict';

module.exports = (config, deploysController) => ({
  deployInProgress: require('./deploy-in-progress')(config, deploysController),
  preview: require('./preview-release')(config, deploysController),
  release: require('./release')(config)
});
