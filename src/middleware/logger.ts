import config from 'src/config/config';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message} ${stack ? `\n${stack}` : ''}`;
    })
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['info']
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.File({ filename: 'logs/audit.log', level: 'info' })
  ]
});
export default logger;
