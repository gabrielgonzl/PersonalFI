import winston from 'winston';
import chalk from 'chalk';

const { combine, timestamp, printf, errors } = winston.format;

// Mapeo de emojis por nivel de log
const levelEmojis = {
  error: '❌',
  warn: '⚠️ ',
  info: 'ℹ️ ',
  http: '🌐',
  verbose: '💬',
  debug: '🔍',
  silly: '🎭',
};

// Colores personalizados para cada nivel
const levelColors = {
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.cyan,
  http: chalk.magenta,
  verbose: chalk.gray,
  debug: chalk.blue,
  silly: chalk.white,
};

// Formato personalizado con emojis y colores
const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  const emoji = levelEmojis[level] || '';
  const color = levelColors[level] || ((text) => text);

  // Timestamp con formato más legible
  const time = chalk.gray(timestamp);

  // Nivel de log con emoji y color
  const levelFormatted = color(`${emoji} ${level.toUpperCase().padEnd(7)}`);

  // Mensaje con stack trace si existe
  let output = `${time} ${levelFormatted} ${message}`;

  if (stack) {
    output += `\n${chalk.gray(stack)}`;
  }

  // Metadatos adicionales si existen
  if (Object.keys(metadata).length > 0) {
    output += `\n${chalk.gray(JSON.stringify(metadata, null, 2))}`;
  }

  return output;
});

// Niveles de log según ambiente
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Crear logger
const logger = winston.createLogger({
  level,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    // Console transport (siempre activo)
    new winston.transports.Console(),
  ],
});

// En producción, también guardar en archivos
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export default logger;
