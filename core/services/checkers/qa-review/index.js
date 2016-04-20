'use strict';

const github = require('../../../../lib/github');
const createQAReviewSubscriber = require('./qaReviewSubscriber');
const createQAReviewService    = require('./qaReviewService');
const createQAReviewChecker    = require('./qaReviewChecker');

module.exports = {
  subscribe: (emitter) => {
    const qaReviewChecker  = createQAReviewChecker(github);
    const qaReviewService  = createQAReviewService(qaReviewChecker, github);
    const qaReviewSubscriber = createQAReviewSubscriber(emitter, qaReviewService);
    qaReviewSubscriber.subscribe();
  }
};
