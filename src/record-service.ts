import {
	BaseQueryParams,
	FullListQueryParams,
	ListQueryParams,
	ListResult,
	RecordListQueryParams,
	RecordQueryParams,
	RecordService,
	RecordSubscription,
	UnsubscribeFunc
} from 'pocketbase';
import { Filter, FilterParam } from './filter';
import { BaseRecord, SystemFields, TypedRecord } from './types';
import { FieldsParam } from './fields';
import { SortParam } from './sort';

// @ts-expect-error
export interface TypedRecordService<T extends BaseRecord = BaseRecord> extends RecordService {
	getFullList<Select extends keyof T = keyof T>(
		queryParams?: TypedFullListQueryParams<T, Select> | undefined
	): Promise<TypedRecord<T, Select>[]>;

	getFullList<Select extends keyof T = keyof T>(
		batch?: number,
		queryParams?: TypedRecordListQueryParams<T, Select> | undefined
	): Promise<TypedRecord<T, Select>[]>;

	getList<Select extends keyof T = keyof T>(
		page?: number | undefined,
		perPage?: number | undefined,
		queryParams?: TypedRecordListQueryParams<T, Select> | undefined
	): Promise<ListResult<TypedRecord<T, Select>>>;

	getFirstListItem<Select extends keyof T = keyof T>(
		filter: Filter<T>,
		queryParams?: TypedRecordListQueryParams<T, Select> | undefined
	): Promise<TypedRecord<T, Select>>;

	getOne<Select extends keyof T = keyof T>(
		id: string,
		queryParams?: TypedRecordQueryParams<T, Select> | undefined
	): Promise<TypedRecord<T, Select>>;

	create<Select extends keyof T = keyof T>(
		bodyParams: Omit<T, keyof SystemFields>,
		queryParams?: TypedRecordQueryParams<T, Select>
	): Promise<TypedRecord<T, Select>>;

	update<Select extends keyof T = keyof T>(
		id: string,
		bodyParams: Partial<Omit<T, keyof SystemFields>>,
		queryParams?: TypedRecordQueryParams<T, Select>
	): Promise<TypedRecord<T, Select>>;

	subscribe(
		topic: '*' | (string & {}),
		callback: (data: RecordSubscription<TypedRecord<T>>) => void
	): Promise<UnsubscribeFunc>;
}

export interface TypedBaseQueryParams<T extends BaseRecord, S extends keyof T>
	extends BaseQueryParams {
	fields?: FieldsParam<T, S>;
}

export interface TypedRecordQueryParams<T extends BaseRecord, S extends keyof T>
	extends TypedBaseQueryParams<T, S>,
		Omit<RecordQueryParams, 'fields'> {
	expand?: string;
}

export interface TypedListQueryParams<T extends BaseRecord, S extends keyof T>
	extends TypedBaseQueryParams<T, S>,
		Omit<ListQueryParams, 'fields' | 'filter' | 'sort'> {
	filter?: FilterParam<T>;
	sort?: SortParam<T>;
}

export interface TypedFullListQueryParams<T extends BaseRecord, S extends keyof T>
	extends TypedListQueryParams<T, S>,
		Omit<FullListQueryParams, 'fields' | 'filter' | 'sort'> {}

export interface TypedRecordListQueryParams<T extends BaseRecord, S extends keyof T>
	extends TypedListQueryParams<T, S>,
		TypedRecordQueryParams<T, S>,
		Omit<RecordListQueryParams, 'fields' | 'filter' | 'sort'> {}
