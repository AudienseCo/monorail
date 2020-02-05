'use strict';

module.exports = (config) => ({
  deployInProgress: require('./deploy-in-progress')(config),
  preview: require('./preview-release')(config),
  release: require('./release')(config)
});
