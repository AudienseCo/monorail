'use strict';

const deployNotes = require('../../../../../core/services/checkers/deploy-labels');

describe('Deploy labels module builder', () => {

  context('Interface', () => {
    it('should have the "subscribe" method', () => {
      deployNotes.subscribe.should.be.a.Function();
    });
  });

});
