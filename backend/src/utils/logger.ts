/**
 * Minimal logger.
 *
 * `console.log` + an ISO timestamp and a level tag. Swap for pino or
 * winston later if structured logging is needed.
 */

function stamp(level: string): string {
  return `[${new Date().toISOString()}] [${level}]`;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    if (meta !== undefined) {
      // eslint-disable-next-line no-console
      console.log(stamp("info"), message, meta);
    } else {
      // eslint-disable-next-line no-console
      console.log(stamp("info"), message);
    }
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    if (meta !== undefined) {
      // eslint-disable-next-line no-console
      console.warn(stamp("warn"), message, meta);
    } else {
      // eslint-disable-next-line no-console
      console.warn(stamp("warn"), message);
    }
  },
  error(message: string, meta?: Record<string, unknown>): void {
    if (meta !== undefined) {
      // eslint-disable-next-line no-console
      console.error(stamp("error"), message, meta);
    } else {
      // eslint-disable-next-line no-console
      console.error(stamp("error"), message);
    }
  },
};
