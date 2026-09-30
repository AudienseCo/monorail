'use strict';

const MAX_ERROR_LENGTH = 500;

module.exports = {
  NO_CHANGES: {
    text: 'Monorail didn\'t deploy anything as there are no changes since the last deploy.',
    color: '#439FE0'
  },
  DEPLOY_NOTES: {
    text: 'Monorail didn\'t deploy anything as there is one pull request with deploy notes label added.',
    color: 'danger'
  },
  NO_SERVICES: {
    text: 'Monorail didn\'t deploy anything because there is no pull request linked to services to deploy.',
    color: 'warning'
  },
  INVALID_REPO_CONFIG: {
    text: 'Monorail didn\'t deploy anything because it couldn\'t read the repo config.',
    color: 'danger'
  },
  INVALID_REPO_STATUS: {
    text: 'Monorail didn\'t deploy anything because it couldn\'t get the status of the dev branch.',
    color: 'danger'
  },
  BRANCH_CREATION_FAILED: {
    text: 'Monorail didn\'t deploy anything because it couldn\'t create the deploy branch.',
    color: 'danger'
  },
  REPO_DEPLOY_FAILED: repoDeployFailed,
  UNkNOWN_ERROR: ({ failReason }) => ({
    text: `Monorail failed with an unexpected error${failReason ? ` (${failReason})` : ''}. Check the monorail logs before deploying again: some services may have been deployed.`,
    color: 'danger'
  })
};

function repoDeployFailed({ failStep, failMessage, branch }) {
  const reason = failMessage ? `\n>${truncate(failMessage)}` : '';
  const branchInfo = branch ? ` \`${branch}\`` : '';

  switch (failStep) {
    case 'build':
      return {
        text: `Deploy failed in the CI job. Services may be partially deployed; nothing was merged into master or dev and the deploy branch${branchInfo} was kept.${reason}`,
        color: 'danger'
      };
    case 'merge':
      return {
        text: `Services were deployed, but Monorail couldn't merge the deploy branch${branchInfo} into master and dev, so master is behind production. Merge it by hand before the next deploy.${reason}`,
        color: 'danger'
      };
    case 'labels':
      return {
        text: `Services were deployed and merged, but Monorail couldn't add the deployed label to the pull requests, and no release was created.${reason}`,
        color: 'warning'
      };
    case 'release':
      return {
        text: `Services were deployed and merged, but Monorail couldn't create the GitHub release.${reason}`,
        color: 'warning'
      };
    default:
      return {
        text: `Deploy failed. Check the monorail logs before deploying again: some services may have been deployed.${reason}`,
        color: 'danger'
      };
  }
}

function truncate(text) {
  return text.length > MAX_ERROR_LENGTH ? `${text.slice(0, MAX_ERROR_LENGTH)}…` : text;
}
