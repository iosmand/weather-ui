import pino from 'pino';
import { env } from '$env/dynamic/private';

const isProd = env.NODE_ENV === 'production';
const level = env.LOG_LEVEL || (isProd ? 'info' : 'debug');

const base = pino({
	level,
	// Pretty-print in dev for readability; plain JSON lines in prod for log aggregation.
	transport: isProd
		? undefined
		: {
				target: 'pino-pretty',
				options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
			}
});

export function createLogger(scope: string) {
	return base.child({ scope });
}

export const logger = createLogger('app');
