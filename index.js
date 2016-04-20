const EventEmitter        = require('events');
const createPublicWebApp  = require('./web');
const createPrivateWebApp = require('./web/private');
const actions             = require('./core/actions');

const emitter = new EventEmitter();
const githubSecret = process.env.GH_SECRET;

const publicWebApp  = createPublicWebApp(emitter, githubSecret);
const privateWebApp = createPrivateWebApp(actions);

actions.subscribeCheckersToEvents(emitter);

publicWebApp.listen(process.env.PORT || 8080);
privateWebApp.listen(8484);
