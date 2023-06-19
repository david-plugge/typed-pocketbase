import { Record as PocketBaseRecord } from 'pocketbase';

type Simplify<T> = T extends infer o ? { [K in keyof o]: o[K] } : never;

export type BaseRecord = Record<string, any>;

export type TypedRecord<
	T,
	Keys extends keyof T = keyof T,
	Data = Simplify<Pick<T, Keys>>
> = Data & {
	export(): Data;
	$export(): Data;
} & Omit<PocketBaseRecord, 'export' | '$export'>;

export interface SystemFields {
	id: string;
	created: string;
	update: string;
}

export type BaseCollectionRecords = Record<string, BaseRecord>;
