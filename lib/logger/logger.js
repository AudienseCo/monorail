
module.exports = (settings, createLogger) => {
  const logger = createLogger(settings);

  function error() {
    logger.debug(...arguments);
    logger.error(...arguments);
  };

  function info() {
    logger.info(...arguments);
  };

  function debug() {
    logger.debug(...arguments);
  };

  return {
    error,
    info,
    debug
  };
};
