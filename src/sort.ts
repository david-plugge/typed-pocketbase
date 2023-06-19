import { BaseRecord } from './types';

export type SortParam<T extends BaseRecord> = {
	__record__?: T;
} & string;

export function sort<T extends BaseRecord>(
	...sorters: Array<SortParam<T> | `${'+' | '-'}${keyof T & string}`>
): SortParam<T> {
	return sorters.filter(Boolean).join(',');
}

export function asc<T extends BaseRecord>(column: keyof T): SortParam<T> {
	return `+${String(column)}`;
}

export function desc<T extends BaseRecord>(column: keyof T): SortParam<T> {
	return `-${String(column)}`;
}
