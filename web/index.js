'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

module.exports = function(eventEmitter, secret) {
  var app = express();

  function signBlob(key, blob) {
    return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex');
  }

  app.use(bodyParser.urlencoded({
    extended: true,
    verify: function(req, res, buffer) {
      if (!req.get('x-hub-signature'))
        throw new Error('No X-Hub-Signature found on request');

      if (!req.get('x-github-event'))
        throw new Error('No X-Github-Event found on request');

      var signature = req.get('x-hub-signature');
      var computedSignature = signBlob(secret, buffer);

      console.log('verified', signature, computedSignature);

      if (signature !== computedSignature) {
        console.warn('Recieved an invalid HMAC: calculated:' +
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
    eventEmitter.emit(event, req.body.payload);
    res.status(200).send('ok');
  });

  return app;
};
