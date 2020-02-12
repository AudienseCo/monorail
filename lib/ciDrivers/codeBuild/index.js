'use strict';
const AWS = require('aws-sdk');;
const createCodeBuild = require('./codeBuild');
module.exports = createCodeBuild(AWS.CodeBuild);
