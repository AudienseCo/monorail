'use strict';

const EventEmitter        = require('events');
const createPublicWebApp  = require('./web/public');
const createPrivateWebApp = require('./web/private');
const actions             = require('./core/actions');

const emitter = new EventEmitter();
const githubSecret = process.env.GH_SECRET;

const publicWebApp  = createPublicWebApp(emitter, githubSecret);
const privateWebApp = createPrivateWebApp(actions);

actions.subscribeCheckersToEvents(emitter);

const publicPort = process.env.PORT || 8080;
publicWebApp.listen(publicPort, err => {
  if (err) console.error('Error starting the public server', err);
  else console.info(`Listening public server in ${publicPort}`);
});

const privatePort = process.PRIVATE_PORT || 8484;
privateWebApp.listen(privatePort, err => {
  if (err) console.error('Error starting the private server', err);
  else console.info(`Listening private server in ${privatePort}`);
});
