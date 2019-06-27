'use strict';

module.exports = () => {
  let busy = false;

  function start() {
    if (busy) throw new Error('DEPLOY_IN_PROGRESS');
    busy = true;
  }

  function finish() {
    busy = false;
  }

  function isBusy() {
    return busy;
  }

  return {
    start,
    finish,
    isBusy
  };
}
