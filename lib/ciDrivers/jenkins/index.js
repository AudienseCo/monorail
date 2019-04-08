'use strict';
const jenkinsApi = require('jenkins');
const createJenkins = require('./jenkins');
module.exports = createJenkins(jenkinsApi);
