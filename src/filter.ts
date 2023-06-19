import { BaseRecord } from './types';

type ActualFilter<T extends BaseRecord, K extends keyof T = keyof T> = [K, FilterOperand, T[K]];

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

function serializeFilter([key, op, val]: ActualFilter<any>) {
	return `${String(key)}${op}${typeof val === 'string' ? `'${val}'` : val}`;
}

function serializeFilters(filters: Filter<any>[]) {
	return filters
		.filter(Boolean)
		.map((filter) => (Array.isArray(filter) ? serializeFilter(filter) : filter));
}

export function and<T extends BaseRecord>(...filters: Filter<T>[]): FilterParam<T> {
	const str = serializeFilters(filters).join(' && ');

	return `(${str})`;
}

export function or<T extends BaseRecord>(...filters: Filter<T>[]): FilterParam<T> {
	const str = filters
		.filter(Boolean)
		.map((filter) => (Array.isArray(filter) ? serializeFilter(filter) : filter))
		.join(' || ');
	return `(${str})`;
}

export function eq<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilter([column, '=', value]);
}

export function neq<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilter([column, '!=', value]);
}

export function gt<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilter([column, '>', value]);
}

export function gte<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilter([column, '>=', value]);
}

export function lt<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilter([column, '<', value]);
}

export function lte<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilter([column, '<=', value]);
}

export function like<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilter([column, '~', value]);
}

export function nlike<T extends BaseRecord, Key extends keyof T>(
	column: Key,
	value: T[Key]
): FilterParam<T> {
	return serializeFilter([column, '!~', value]);
}
