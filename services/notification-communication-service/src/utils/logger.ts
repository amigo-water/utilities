// import winston from 'winston';
// import dotenv from 'dotenv';

// dotenv.config();

// const { combine, timestamp, printf, colorize, json } = winston.format;

// const logFormat = printf(({ level, message, timestamp, ...meta }) => {
//   let logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
//   // Add metadata if present
//   const metaKeys = Object.keys(meta);
//   if (metaKeys.length > 0) {
//     logMessage += ` | ${JSON.stringify(meta, null, 2)}`;
//   }
  
//   return logMessage;
// });

// const logger = winston.createLogger({
//   level: process.env.LOG_LEVEL || 'info',
//   format: combine(
//     timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     process.env.NODE_ENV === 'production' ? json() : combine(colorize(), logFormat)
//   ),
//   transports: [
//     new winston.transports.Console(),
//     // Add file transport in production
//     ...(process.env.NODE_ENV === 'production' ? [
//       new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
//       new winston.transports.File({ filename: 'logs/combined.log' })
//     ] : [])
//   ],
//   exitOnError: false
// });

// // Create a stream for morgan
// logger.stream = {
//   write: (message: string) => {
//     logger.info(message.trim());
//   },
// };

// export default logger;
