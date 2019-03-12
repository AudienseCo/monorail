'use strict';

const ERROR_TEMPLATES = require('./errors');
const RELEASE_PREVIEW = require('./release-preview');

module.exports = (releasePreview) => {

  const text = releasePreview.reduce((res, repoPreview) => {
    if (repoPreview.error) {
      res += errorMessage(repoPreview.error);
    }
    else res += RELEASE_PREVIEW(repoPreview);
    return res;
  }, '');

  return {
    pretext: '',
    text: text
  };

  function errorMessage(error) {
    return ERROR_TEMPLATES[error.message] || ERROR_TEMPLATES.UNkNOWN_ERROR;
  }
};
