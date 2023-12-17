import {
	BaseRecord,
	GenericCollection,
	RecordWithExpandToDotPath
} from './types.js';

export type SortParam<T extends BaseRecord> = {
	__record__?: T;
} & string;

export type Sort<T extends GenericCollection> =
	| SortParam<RecordWithExpandToDotPath<T>>
	| PrefixedSortItem<keyof RecordWithExpandToDotPath<T>>;

export type PrefixedSortItem<T> = T extends string ? `${'+' | '-'}${T}` : never;

export function sort<T extends BaseRecord>(
	...sorters: Array<SortParam<T> | PrefixedSortItem<keyof T>>
): SortParam<T> {
	return sorters.filter(Boolean).join(',');
}

export function asc<T extends BaseRecord>(column: keyof T): SortParam<T> {
	return `+${String(column)}`;
}

export function desc<T extends BaseRecord>(column: keyof T): SortParam<T> {
	return `-${String(column)}`;
}
