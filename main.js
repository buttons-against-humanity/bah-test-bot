'use strict';
require('dotenv').config();
const Logger = require('bunyan');
const { Bot } = require('./bot');

const { LOG_LEVEL, LOG_FILE, SERVER_URL } = process.env;

const setupLogger = function() {
  const logParams = {
    serializers: {
      req: Logger.stdSerializers.req,
      res: Logger.stdSerializers.res,
      err: Logger.stdSerializers.err
    },
    level: LOG_LEVEL || 'INFO'
  };

  if (LOG_FILE) {
    logParams.streams = [{ path: LOG_FILE }];
  } else {
    logParams.streams = [{ stream: process.stderr }];
  }

  logParams.name = 'BOT';

  const logger = new Logger(logParams);
  logger.debug('Initializing');
  return logger;
};

const printUsage = function(err) {
  console.log(`
Usage:
  ${process.argv[1]} <name> <game_uuid> [how-many]
  `);
  process.exit(err ? 1 : 0);
};

const logger = setupLogger();
if (process.argv.length < 4) {
  printUsage();
}

const startBot = function(name, game_uuid) {
  const bot = new Bot(logger, name, game_uuid);
  bot.connect(SERVER_URL);
};

if (Number(process.argv[4])) {
  for (let i = 0; i < Number(process.argv[4]); i++) {
    startBot(`${process.argv[2]} ${i + 1}`, process.argv[3]);
  }
} else {
  startBot(process.argv[2], process.argv[3]);
}
