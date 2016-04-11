'use strict';

const deployNotes = require('../../../checkers/code-review');

describe('Code Review module builder', () => {

  context('Interface', () => {
    it('should have the "subscribe" method', () => {
      deployNotes.subscribe.should.be.a.Function();
    });
  });

});
