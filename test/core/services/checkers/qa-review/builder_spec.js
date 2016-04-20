'use strict';

const deployNotes = require('../../../../../core/services/checkers/qa-review');

describe('QA Review module builder', () => {

  context('Interface', () => {
    it('should have the "subscribe" method', () => {
      deployNotes.subscribe.should.be.a.Function();
    });
  });

});
