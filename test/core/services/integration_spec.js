'use strict';

const config = require('../../../config');
const github = require('../../../lib/github');
const getBranchStatus = require('../../../core/services/getBranchStatus')(github);

// const repo = 'socialbro';
// getRepoConfig(repo, (err, res) => {
//   console.log(err,  res);
//   process.exit();
// });

// github.getCommitStatus('typescript-ecs-boilerplate', 'heads/staging', (err, data) => {
//   console.log(err, data);
//   process.exit();
// });

// github.getChecksForRef('typescript-ecs-boilerplate', 'heads/staging', (err, data) => {
//   console.log(err, data);
//   process.exit();
// });

// github.getBranchProtection('typescript-ecs-boilerplate', 'staging', (err, data) => {
//   console.log(err, data);
//   process.exit();
// });

// github.getProtectedBranchRequiredStatusChecks('typescript-ecs-boilerplate', 'staging', (err, data) => {
//   const contexts = data.contexts;
//   github.getChecksForRef('typescript-ecs-boilerplate', 'heads/staging', (err, data) => {
//     console.log(err, data);

//     const res = data.check_runs.reduce(({ status, conclusion }, check) => {
//       if (!contexts.includes(check.name)) return { status, conclusion };
//       return {
//         status: status !== 'completed'  || check.status !== 'completed' ?  status :  'completed',
//         conclusion: conclusion !== 'success'  || check.conclusion !== 'success' ?  conclusion :  'success',
//       };
//     }, { conclusion: 'success', status: 'completed' });
//     console.log('res', res);
//     process.exit();
//   });
// });

// getBranchStatus('typescript-ecs-boilerplate', 'staging', (err, sha, success) => {
//   console.log(err, sha, success);
// });
