
const SECRET_KEY = /pass(word)?|token|secret|webhook/i;

module.exports = (settings, createLogger) => {
  const logger = createLogger(settings);

  function error() {
    logger.error(...format(arguments));
  };

  function info() {
    logger.info(...format(arguments));
  };

  function debug() {
    logger.debug(...format(arguments));
  };

  return {
    error,
    info,
    debug
  };
};

// winston only keeps the first object after the message and serializes
// errors as {}, so fold every extra argument into one redacted meta object
function format(args) {
  const [message, ...rest] = args;
  const meta = rest.reduce((acc, arg) => {
    if (arg instanceof Error) return Object.assign(acc, { error: serialize(arg) });
    if (Array.isArray(arg)) return Object.assign(acc, { data: serialize(arg) });
    if (arg && typeof arg === 'object') return Object.assign(acc, serialize(arg));
    if (arg !== undefined) acc.details = (acc.details || []).concat(arg);
    return acc;
  }, {});
  return Object.keys(meta).length > 0 ? [message, meta] : [message];
}

function serialize(value, seen = new WeakSet()) {
  if (value instanceof Error) {
    const { message, stack, status, code } = value;
    return Object.assign({ message, stack }, status && { status }, code && { code });
  }
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  if (Array.isArray(value)) return value.map(item => serialize(item, seen));
  return Object.keys(value).reduce((acc, key) => {
    acc[key] = SECRET_KEY.test(key) ? '[REDACTED]' : serialize(value[key], seen);
    return acc;
  }, {});
}
