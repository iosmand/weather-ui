import pino from 'pino';
import { env } from '$env/dynamic/private';

const isProd = env.NODE_ENV === 'production';
const level = env.LOG_LEVEL || (isProd ? 'info' : 'debug');

function createBase() {
	if (!isProd) {
		// pino-pretty is a devDependency and won't exist in the pruned prod image;
		// if transport setup fails for any reason, fall back to plain JSON instead of crashing.
		try {
			return pino({
				level,
				transport: {
					target: 'pino-pretty',
					options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
				}
			});
		} catch {
			// fall through to plain logger below
		}
	}
	return pino({ level });
}

const base = createBase();

export function createLogger(scope: string) {
	return base.child({ scope });
}

export const logger = createLogger('app');
