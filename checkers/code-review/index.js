'use strict';

const github = require('../../lib/github');
const createCodeReviewSubscriber = require('./codeReviewSubscriber');
const createCodeReviewService    = require('./codeReviewService');
const createCodeReviewChecker    = require('./codeReviewChecker');

module.exports = {
  subscribe: (emitter) => {
    const codeReviewChecker  = createCodeReviewChecker(github);
    const codeReviewService  = createCodeReviewService(codeReviewChecker, github);
    const codeReviewSubscriber = createCodeReviewSubscriber(emitter, codeReviewService);
    codeReviewSubscriber.subscribe();
  }
};
