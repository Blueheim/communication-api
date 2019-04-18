const { createLogger, format, transports } = require('winston');
const { combine, colorize, timestamp, prettyPrint } = format;

const logger = new createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      format: combine(timestamp(), prettyPrint(), colorize()),
    }),
  ],
});

module.exports = logger;
