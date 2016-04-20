'use strict';

const checkers = [
  require('../services/checkers/code-review'),
  require('../services/checkers/qa-review'),
  require('../services/checkers/deploy-notes')
];

module.exports = {
  subscribeCheckersToEvents: require('./subscribeCheckersToEvents')(checkers)
};
