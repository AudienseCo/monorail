'use strict';

const deployNotes = require('../../../../../core/services/checkers/deploy-notes');

describe('Deploy notes module builder', () => {

  context('Interface', () => {
    it('should have the "subscribe" method', () => {
      deployNotes.subscribe.should.be.a.Function();
    });
  });

});
