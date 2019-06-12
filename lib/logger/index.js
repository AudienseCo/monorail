
const winston = require('winston');
const { combine, simple, timestamp } = winston.format;
const { logger: loggerSettings } = require('../../config');
const createLogger = require('./logger');

function createWinstonLogger({ level }) {
  const winstonLogger = winston.createLogger({
    format: combine(
      timestamp(),
      simple()
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
  if (level) winstonLogger.level = level;
  return winstonLogger
}

module.exports = createLogger(loggerSettings, createWinstonLogger);
