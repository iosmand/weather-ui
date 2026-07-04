import { env } from '$env/dynamic/private';

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const minLevel = (env.LOG_LEVEL as Level) || (env.NODE_ENV === 'production' ? 'info' : 'debug');
const isProd = env.NODE_ENV === 'production';

function serializeError(error: unknown) {
	if (error instanceof Error) {
		return { message: error.message, stack: error.stack };
	}
	return error;
}

function write(level: Level, scope: string, message: string, meta?: Record<string, unknown>) {
	if (LEVELS[level] < LEVELS[minLevel]) return;

	const entry = {
		time: new Date().toISOString(),
		level,
		scope,
		message,
		...(meta ? { meta } : {})
	};

	const line = isProd
		? JSON.stringify(entry)
		: `[${entry.time}] ${level.toUpperCase()} (${scope}) ${message}${meta ? ' ' + JSON.stringify(meta) : ''}`;

	const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
	out(line);
}

export function createLogger(scope: string) {
	return {
		debug: (message: string, meta?: Record<string, unknown>) => write('debug', scope, message, meta),
		info: (message: string, meta?: Record<string, unknown>) => write('info', scope, message, meta),
		warn: (message: string, meta?: Record<string, unknown>) => write('warn', scope, message, meta),
		error: (message: string, error?: unknown, meta?: Record<string, unknown>) =>
			write('error', scope, message, error ? { ...meta, error: serializeError(error) } : meta)
	};
}

export const logger = createLogger('app');
