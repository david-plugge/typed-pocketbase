import { BaseRecord } from './types.js';

export type FieldsParam<T extends BaseRecord, S extends keyof T> = {
	__record__?: T;
	__select__?: S;
} & string;

export function fields<T extends BaseRecord, S extends keyof T>(
	...fields: (S | false | undefined | null | keyof T)[]
): FieldsParam<T, S> {
	return fields.filter(Boolean).join(',');
}
