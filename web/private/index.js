'use strict';

const express = require('express');
const morgan  = require('morgan');
const bodyParser = require('body-parser');

module.exports = function(actions) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(morgan(`[private] :remote-addr - :remote-user [:date[clf]] ":method :url \
    HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"`));

  app.get('/', (req, res) => {
    res.status(200).send('pong!');
  });

  app.get('/deploy-info', (req, res) => {
    if (!req.query.pr)
      return res.status(400).send({ error: 'You must include the "pr" parameter' });

    const pullRequestIdsStr = req.query.pr;
    const pullRequestIds    = pullRequestIdsStr.split(',');

    actions.getPullRequestsDeployInfo(pullRequestIds, (err, info) => {
      if (err) res.status(400).send(err);
      else res.status(200).send(info);
    });

  });

  app.post('/create-release', (req, res) => {
    if (!req.body.tag)
      return res.status(400).send({ error: 'You must include the "tag" parameter' });

    if (!req.body.pr)
      return res.status(400).send({ error: 'You must include the "pr" parameter' });

    const tagName           = req.body.tag;
    const pullRequestIdsStr = req.body.pr;
    const pullRequestIds    = pullRequestIdsStr.split(',');

    actions.createRelease(tagName, pullRequestIds, (err, result) => {
      if (err) res.status(400).send(err);
      else res.status(200).send(result);
    });

  });

  return app;
};
