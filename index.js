const EventEmitter = require('events');
const createWebApp = require('./web');
const actions      = require('./core/actions');

const emitter = new EventEmitter();
const githubSecret = process.env.GH_SECRET;
const webApp  = createWebApp(emitter, githubSecret);

actions.subscribeCheckersToEvents(emitter);

webApp.listen(process.env.PORT || 8080);
