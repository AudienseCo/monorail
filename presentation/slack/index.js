'use strict';

module.exports = (config) => ({
  preview: require('./preview-release')(config),
  release: require('./release')(config)
});
