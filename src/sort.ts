import type { BaseRecord } from './types.js';

export type Sort<T extends BaseRecord> =
	| `${'+' | '-'}${keyof T & string}`
	| false
	| null
	| undefined;
