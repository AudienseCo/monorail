const EventEmitter = require('events');
const createWebApp = require('./web');

const emitter = new EventEmitter();

const deployNotesCheck = require('./core/services/checkers/deploy-notes');
deployNotesCheck.subscribe(emitter);

const qaReviewChecker = require('./core/services/checkers/qa-review');
qaReviewChecker.subscribe(emitter);

const codeReviewChecker = require('./core/services/checkers/code-review');
codeReviewChecker.subscribe(emitter);

const githubSecret = process.env.GH_SECRET;

const webApp  = createWebApp(emitter, githubSecret);
webApp.listen(process.env.PORT || 8080);
