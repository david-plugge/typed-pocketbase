import type { BaseRecord } from './types.js';

type ActualFilter<T extends any, K extends keyof T = keyof T> = [
	K,
	FilterOperand,
	T[K]
];

export type FilterOperand =
	| '='
	| '!='
	| '>'
	| '>='
	| '<'
	| '<='
	| '~'
	| '!~'
	| '?='
	| '?!='
	| '?>'
	| '?>='
	| '?<'
	| '?<='
	| '?~'
	| '?!~';

export type FilterParam<T extends BaseRecord> = { __record__?: T } & string;

export type Filter<T extends BaseRecord> =
	| ActualFilter<T>
	| FilterParam<T>
	| false
	| null
	| undefined;

export function serializeFilterTuple([key, op, val]: ActualFilter<any>) {
	const type = typeof val;
	if (type === 'boolean' || type === 'number') {
		val = val.toString();
	} else if (type === 'string') {
		val = "'" + val.replace(/'/g, "\\'") + "'";
	} else if (val === null) {
		val = 'null';
	} else if (val instanceof Date) {
		val = "'" + val.toISOString().replace('T', ' ') + "'";
	} else {
		val = "'" + JSON.stringify(val).replace(/'/g, "\\'") + "'";
	}

	return `${String(key)} ${op} ${val}`;
}

export function serializeFilter(filter: Filter<any>): string | null {
	if (!filter) return null;
	return Array.isArray(filter) ? serializeFilterTuple(filter) : filter;
}

export function serializeFilters(filters: Filter<any>[]) {
	return filters.filter((val) => !!val).map(serializeFilter);
}

export function and<T extends BaseRecord>(
	...filters: Filter<T>[]
): FilterParam<T> {
	const str = serializeFilters(filters).join(' && ');
	if (!str.length) return '';
	return `(${str})`;
}

export function or<T extends BaseRecord>(
	...filters: Filter<T>[]
): FilterParam<T> {
	const str = serializeFilters(filters).join(' || ');
	if (!str.length) return '';
	return `(${str})`;
}

export function eq<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilterTuple([column, '=', value]);
}

export function neq<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilterTuple([column, '!=', value]);
}

export function gt<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilterTuple([column, '>', value]);
}

export function gte<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilterTuple([column, '>=', value]);
}

export function lt<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilterTuple([column, '<', value]);
}

export function lte<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilterTuple([column, '<=', value]);
}

export function like<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilterTuple([column, '~', value]);
}

export function nlike<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilterTuple([column, '!~', value]);
}
