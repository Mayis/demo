const winston = require("winston");
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

// Map log levels to match Python's logging levels
const nameToLevel = {
  CRITICAL: "error", // Winston doesn't have a "critical" level, so we use "error"
  FATAL: "error", // Winston doesn't have a "fatal" level, so we use "error"
  ERROR: "error",
  WARNING: "warn",
  INFO: "info",
  DEBUG: "debug",
};

// Define a custom log format
const logFormat = printf(({ level, message, timestamp, name }) => {
  return `${timestamp} - ${level.toUpperCase()} - ${name} - ${message}`;
});

// Create the base logger
const logger = createLogger({
  level: "info", // Default log level
  format: combine(timestamp(), logFormat),
  transports: [new transports.Console({ stream: process.stdout })],
});

// Disable propagation (equivalent to logger.propagate = False in Python)
logger.propagate = false;

// Set the log level based on the environment variable
const logLevel = nameToLevel[process.env.log_level] || "info";
logger.level = logLevel;

// Enable capturing warnings (equivalent to logging.captureWarnings(True) in Python)
winston.captureWarnings(true);

/**
 * Returns a child logger with the specified name and log level.
 * @param {string} logName - The name of the child logger.
 * @param {string} level - The log level for the child logger.
 * @returns {Object} - The child logger instance.
 */
function getLogger(logName, level = logLevel) {
  const childLogger = logger.child({ name: logName });
  if (level) {
    childLogger.level = level;
  }
  return childLogger;
}

module.exports = { getLogger };
