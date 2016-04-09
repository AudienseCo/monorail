'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

module.exports = function(eventEmitter, githubToken) {
  var app = express();
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.status(200).send('pong!');
  });

  app.post('/ghwebook', (req, res) => {
    const event     = req.headers['X-GitHub-Event'];
    const signature = req.headers['X-Hub-Signature'];
    console.log('>> req.body.payload', req.body.payload);
    console.log('>> req.body', req.body);
    verifySignature(signature, req.body.payload, (err, success) => {
      if (success) {
        eventEmitter.emit(event, req.body.payload);
      }
      res.status(200).send('ok');
    });
  });

  function verifySignature(originalSignature, payload, cb) {
    const hmac = crypto.createHmac('sha256', githubToken);

    hmac.on('readable', () => {
      const data = hmac.read();
      if (data) {
        const str  = data.toString('hex');
        const success = str === originalSignature;

        cb(null, success);
      }

    });

    hmac.write(payload);
    hmac.end();
  }

  return app;
};
