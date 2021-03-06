'use strict';

const express = require('express');
const morgan  = require('morgan');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const logger = require('../../lib/logger');

module.exports = function(eventEmitter, secret) {
  const app = express();

  function signBlob(key, blob) {
    return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex');
  }

  app.use(morgan(`[public] :remote-addr - :remote-user [:date[clf]] ":method :url \
    HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"`));

  app.use(bodyParser.urlencoded({
    extended: true,
    verify: function(req, res, buffer) {
      if (!req.get('x-hub-signature'))
        throw new Error('No X-Hub-Signature found on request');

      if (!req.get('x-github-event'))
        throw new Error('No X-Github-Event found on request');

      const signature = req.get('x-hub-signature');
      const computedSignature = signBlob(secret, buffer);

      logger.debug('verified', signature, computedSignature);

      if (signature !== computedSignature) {
        logger.error('Recieved an invalid HMAC: calculated:' +
          computedSignature + ' != recieved:' + signature);
        throw new Error('Invalid Signature');
      }
    }
  }));

  app.get('/', (req, res) => {
    res.status(200).send('pong!');
  });

  app.post('/ghwebook', (req, res) => {
    const event = req.get('x-github-event');
    try {
      const payload = JSON.parse(req.body.payload);
      eventEmitter.emit(event, payload);
      res.status(200).send('ok');
    }
    catch (ex) {
      logger.error('ghwebook public endpoint error', ex, { payload: req.body.payload });
      res.status(500).send(ex);
    }

  });

  return app;
};
