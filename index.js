const EventEmitter = require('events');
const createWebApp = require('./web');

const emitter = new EventEmitter();

const deployNotesCheck = require('./checkers/deploy-notes');
deployNotesCheck.subscribe(emitter);

const githubSecret = process.env.GH_SECRET;

const webApp  = createWebApp(emitter, githubSecret);
webApp.listen(process.env.PORT || 8080);