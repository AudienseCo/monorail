'use strict';

require('should');
const EventEmitter = require('events');
const createSubscribeCheckersToEvents = require('../../../core/actions/subscribeCheckersToEvents');

describe('Subscribe checkers to events action', () => {

  context('Interface', () => {
    const subscribeCheckersToEvents = createSubscribeCheckersToEvents([]);

    it('should be a function', () => {
      subscribeCheckersToEvents.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should subscribe the checkers with the event emitter', done => {
      const dummyChecker = {
        subscribe: () => {
          done();
        }
      };
      const subscribeCheckersToEvents = createSubscribeCheckersToEvents([dummyChecker]);
      const emitter = new EventEmitter();
      subscribeCheckersToEvents(emitter);
    });
  });
});
