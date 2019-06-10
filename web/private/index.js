'use strict';

const express = require('express');
const morgan  = require('morgan');
const bodyParser = require('body-parser');
const config = require('../../config');

module.exports = function(actions) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(morgan(`[private] :remote-addr - :remote-user [:date[clf]] ":method :url \
    HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"`));

  app.get('/', (req, res) => {
    res.status(200).send('pong!');
  });

  app.get('/release-notes', (req, res) => {
    if (!req.query.pr)
      return res.status(400).send({ error: 'You must include the "pr" parameter' });

    const pullRequestIdsStr = req.query.pr;
    const pullRequestIds    = pullRequestIdsStr.split(',');
    const filterLabelsStr   = req.query.labels || '';
    const filterLabels      = filterLabelsStr.length ? filterLabelsStr.split(',') : [];
    const repo = req.query.repo || config.github.repo;

    actions.getReleaseNotes(repo, pullRequestIds, filterLabels, (err, result) => {
      if (err) return res.status(400).send(err);

      const info = {
        body: result
      };

      res.status(200).send(info);
    });

  });

  app.get('/slack-preview-release', (req, res) => {
    const verbose = req.query.verbose || false;
    actions.slackPreviewRelease({ verbose }, (err) => {
      if (err) {
        console.error('Error', err);
        return res.status(400).send(err);
      }
      res.status(200).send('OK');
    });

  });

  app.get('/deploy', (req, res) => {
    const showPreview = req.query.showPreview || false;
    const repos = req.query.repos || config.github.repos;
    const verbose = req.query.verbose || false;
    console.info('Deploy started');
    actions.startDeploy({ repos, showPreview, verbose }, (err) => {
      if (err) {
        console.error('Error', err);
      }
      console.info('Deploy finished');
    });

    res.status(202).send('Accepted');
  });


  return app;
};
