'use strict';
require('should');
const createDeploysController = require('../../../core/services/deploysController');

describe('deploys crontroller service', () => {
  it('should not allow to start if there is a deploy in progress', () => {
    const deploysController = createDeploysController();
    deploysController.start();
    deploysController.isBusy().should.be.true();
    (() => {
      deploysController.start();
    }).should.throw('DEPLOY_IN_PROGRESS');
  });

  it('should allow to start if there is the deploy finished', () => {
    const deploysController = createDeploysController();
    deploysController.start();
    deploysController.isBusy().should.be.true();
    deploysController.finish();
    deploysController.isBusy().should.be.false();
    deploysController.start();
  });

});
