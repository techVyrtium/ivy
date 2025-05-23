import winston from "winston";
const { combine, timestamp, printf, colorize } = winston.format;

// Define a custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create a logger instance
const logger = winston.createLogger({
  level: "info", // Set the default logging level
  format: combine(
    colorize(), // Add colors to the logs
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamps
    logFormat // Apply the custom log format
  ),
  transports: [
    // Log to the console
    new winston.transports.Console(),

    // Log to a file (optional)
    new winston.transports.File({ filename: "logs/combined.log" }),

    // Log errors to a separate file (optional)
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

// Export the logger
export default logger;
