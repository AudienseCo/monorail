'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const bl = require('bl');
const crypto = require('crypto');

module.exports = function(eventEmitter, secret) {
  var app = express();
  app.use(function(req, res, next) {
    const signature = req.get('X-Hub-Signature');

    req.pipe(bl((err, data) => {
      const sha1 = 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex');
      console.log('verifySignature', sha1, signature);
      if (sha1 === signature) {
        next();
      }
      else {
        res.status(400).send('Invalid signature');
      }
    }));
  });

  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.status(200).send('pong!');
  });

  app.post('/ghwebook', (req, res) => {
    const event = req.get('X-GitHub-Event');
    eventEmitter.emit(event, req.body.payload);
    res.status(200).send('ok');
  });

  return app;
};
