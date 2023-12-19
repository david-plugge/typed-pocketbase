import {
	BaseRecord,
	GenericCollection,
	RecordWithExpandToDotPath
} from './types.js';

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

export type Filter<T extends GenericCollection> = FilterParam<
	RecordWithExpandToDotPath<T>
>;

export type FilterInput<T extends BaseRecord> =
	| ActualFilter<T>
	| FilterParam<T>
	| false
	| null
	| undefined;

function serializeFilter([key, op, val]: ActualFilter<any>) {
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

	return `${String(key)}${op}${val}`;
}

export function serializeFilters(filters: FilterInput<any>[]) {
	return filters
		.filter(Boolean)
		.map((filter) =>
			Array.isArray(filter) ? serializeFilter(filter) : filter
		);
}

export function and<T extends BaseRecord>(
	...filters: FilterInput<T>[]
): FilterParam<T> {
	const str = serializeFilters(filters).join(' && ');
	if (!str.length) return '';
	return `(${str})`;
}

export function or<T extends BaseRecord>(
	...filters: FilterInput<T>[]
): FilterParam<T> {
	const str = serializeFilters(filters).join(' || ');
	if (!str.length) return '';
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
