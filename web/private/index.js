'use strict';

const express = require('express');
const morgan  = require('morgan');
const bodyParser = require('body-parser');
const config = require('../../config');
const logger = require('../../lib/logger');


module.exports = function(actions) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(morgan(`[private] :remote-addr - :remote-user [:date[clf]] ":method :url \
    HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"`));

  app.get('/', (req, res) => {
    res.status(200).send('pong!');
  });

  app.get('/slack-preview-release', (req, res) => {
    const verbose = req.query.verbose || false;
    const repos = req.query.repos || config.github.repos;
    actions.slackPreviewRelease({ repos, verbose }, (err, msgs) => {
      if (err) {
        logger.error('Error', err);
        return res.status(400).send(err);
      }
      res.status(200).json({
        slack_messages: msgs
      });
    });

  });

  app.get('/deploy', (req, res) => {
    const showPreview = req.query.showPreview || false;
    const repos = req.query.repos || config.github.repos;
    const verbose = req.query.verbose || false;
    logger.info('Deploy started');
    actions.startDeploy({ repos, showPreview, verbose }, (err) => {
      if (err) {
        logger.error('Error', err);
        if (err.message === 'DEPLOY_IN_PROGRESS') {
          return res.status(429).send('There is a deploy in progress');
        } else return res.status(400).send('Something failed with the deployment');
      }
      logger.info('Deploy finished');
      res.status(200).send('Ok');
    });

  });

  return app;
};
