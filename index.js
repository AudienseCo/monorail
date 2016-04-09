const EventEmitter = require('events');
const createWebApp = require('./web');

const emitter = new EventEmitter();

const deployNotesCheck = require('./checkers/deploy-notes');
deployNotesCheck.subscribe(emitter);

const githubToken = process.env.GH_TOKEN;

const webApp  = createWebApp(emitter, githubToken);
webApp.listen(8080);
