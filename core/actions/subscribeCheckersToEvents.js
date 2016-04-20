'use strict';

module.exports = checkerServices => {

  return function(emitter) {
    checkerServices.forEach(checker => {
      checker.subscribe(emitter);
    });
  };

};
