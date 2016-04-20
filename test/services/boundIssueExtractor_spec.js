'use strict';

const should = require('should');
const createBoundIssueExtractor = require('../../services/boundIssueExtractor');

describe('Bound Issue Extractor', () => {
  const boundIssueExtractor = createBoundIssueExtractor();

  context('Interface', () => {
    it('should have the "extract" method', () => {
      boundIssueExtractor.extract.should.be.a.Function();
    });
  });

  context('Behaviour', () => {
    it('should return null if the input string is empty', () => {
      should.not.exist(boundIssueExtractor.extract(''));
    });

    it('should return the issue number (Closes #issue)', () => {
      const input = 'Closes #1234';
      boundIssueExtractor.extract(input).should.be.eql('1234');
    });

    it('should return the issue number (Fixes #issue)', () => {
      const input = 'Fixes #1234';
      boundIssueExtractor.extract(input).should.be.eql('1234');
    });

    it('should find the issue in the middle of the text', () => {
      const input = 'This is a dummy text\nFixes #1234\nThis is a dummy text';
      boundIssueExtractor.extract(input).should.be.eql('1234');
    });

    it('should find the issue if it is concated with punctuation marks', () => {
      const input = 'This is a dummy text\nFixes #1234.\nThis is a dummy text';
      boundIssueExtractor.extract(input).should.be.eql('1234');
    });

    it('should not return any issue ("Fixes any text #1234")', () => {
      const input = 'Fixes any text #1234';
      should.not.exist(boundIssueExtractor.extract(input));
    });

  });
});
