'use strict';

module.exports = (config, deploysController) => ({
  preview: require('./preview-release')(config, deploysController),
  release: require('./release')(config)
});
