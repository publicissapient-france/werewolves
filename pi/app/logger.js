const winston = require('winston');
const moment = require('./moment-utc');

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: moment().format(),
      colorize: true,
    }),
  ],
});

logger.level = process.env.LOG_LEVEL || 'debug';

module.exports = logger;
