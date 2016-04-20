'use strict';

const express = require('express');

module.exports = function(actions) {
  var app = express();

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

  return app;
};
