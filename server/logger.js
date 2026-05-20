import { db } from './db.js';

const insertLog = db.prepare(
  'INSERT INTO log_events (workspace_id, user_id, level, service, message, meta) VALUES (?, ?, ?, ?, ?, ?)'
);

export function logEvent({ level = 'info', service = 'app', message, workspaceId = null, userId = null, meta = null }) {
  try {
    insertLog.run(workspaceId, userId, level, service, String(message || ''), JSON.stringify(meta || {}));
  } catch (e) {
    console.error('[logger] failed to write', e);
  }
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(`[${level}] [${service}] ${message}`);
}

export const logger = {
  info: (service, message, opts) => logEvent({ level: 'info', service, message, ...opts }),
  warn: (service, message, opts) => logEvent({ level: 'warn', service, message, ...opts }),
  error: (service, message, opts) => logEvent({ level: 'error', service, message, ...opts }),
  debug: (service, message, opts) => logEvent({ level: 'debug', service, message, ...opts }),
};
