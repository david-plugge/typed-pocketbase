import {
	ListResult,
	RecordService,
	RecordSubscription,
	UnsubscribeFunc
} from 'pocketbase';
import {
	Simplify,
	GenericCollection,
	TypedRecord,
	Fields,
	Columns,
	GenericExpand,
	LooseAutocomplete,
	RecordWithExpandToDotPath
} from './types.js';
import { FieldsParam } from './fields.js';
import { FilterInput, FilterParam } from './filter.js';
import { SortParam } from './sort.js';
import { ExpandParam } from './expand.js';

// @ts-expect-error
export interface TypedRecordService<Collection extends GenericCollection>
	extends RecordService {
	getFullList<
		Select extends Fields<Collection> = Fields<Collection>,
		Expand extends GenericExpand = {}
	>(
		queryParams?: TypedRecordFullListQueryParams<Collection, Select, Expand>
	): Promise<
		TypedRecord<Simplify<Pick<Columns<Collection>, Select>>, Expand>[]
	>;

	getFullList<
		Select extends Fields<Collection> = Fields<Collection>,
		Expand extends GenericExpand = {}
	>(
		batch?: number,
		queryParams?: TypedRecordListQueryParams<Collection, Select, Expand>
	): Promise<
		TypedRecord<Simplify<Pick<Columns<Collection>, Select>>, Expand>[]
	>;

	getList<
		Select extends Fields<Collection> = Fields<Collection>,
		Expand extends GenericExpand = {}
	>(
		page?: number,
		perPage?: number,
		queryParams?: TypedRecordListQueryParams<Collection, Select, Expand>
	): Promise<
		ListResult<
			TypedRecord<Simplify<Pick<Columns<Collection>, Select>>, Expand>
		>
	>;

	getFirstListItem<
		Select extends Fields<Collection> = Fields<Collection>,
		Expand extends GenericExpand = {}
	>(
		filter: FilterInput<RecordWithExpandToDotPath<Collection>>,
		queryParams?: TypedRecordListQueryParams<Collection, Select, Expand>
	): Promise<
		TypedRecord<Simplify<Pick<Columns<Collection>, Select>>, Expand>
	>;

	getOne<
		Select extends Fields<Collection> = Fields<Collection>,
		Expand extends GenericExpand = {}
	>(
		id: string,
		queryParams?: TypedRecordQueryParams<Collection, Select, Expand>
	): Promise<
		TypedRecord<Simplify<Pick<Columns<Collection>, Select>>, Expand>
	>;

	create<
		Select extends Fields<Collection> = Fields<Collection>,
		Expand extends GenericExpand = {}
	>(
		bodyParams: Collection['create'],
		queryParams?: TypedRecordQueryParams<Collection, Select, Expand>
	): Promise<
		TypedRecord<Simplify<Pick<Columns<Collection>, Select>>, Expand>
	>;

	update<
		Select extends Fields<Collection> = Fields<Collection>,
		Expand extends GenericExpand = {}
	>(
		id: string,
		bodyParams: Collection['update'],
		queryParams?: TypedRecordQueryParams<Collection, Select, Expand>
	): Promise<
		TypedRecord<Simplify<Pick<Columns<Collection>, Select>>, Expand>
	>;

	subscribe(
		topic: LooseAutocomplete<'*'>,
		callback: (
			data: RecordSubscription<TypedRecord<Columns<Collection>>>
		) => void
	): Promise<UnsubscribeFunc>;

	subscribe(
		callback: (
			data: RecordSubscription<TypedRecord<Columns<Collection>>>
		) => void
	): Promise<UnsubscribeFunc>;
}

export interface TypedBaseQueryParams<
	T extends GenericCollection,
	S extends Fields<T>
> {
	fields?: FieldsParam<Columns<T>, S>;
	$autoCancel?: boolean;
	$cancelKey?: string;
}

export interface TypedListQueryParams<
	T extends GenericCollection,
	S extends Fields<T>
> extends TypedBaseQueryParams<T, S> {
	page?: number;
	perPage?: number;
	sort?: SortParam<RecordWithExpandToDotPath<T>>;
	filter?: FilterParam<RecordWithExpandToDotPath<T>>;
}

export interface TypedFullListQueryParams<
	T extends GenericCollection,
	S extends Fields<T>
> extends TypedListQueryParams<T, S> {
	batch?: number;
}

export interface TypedRecordQueryParams<
	T extends GenericCollection,
	S extends Fields<T>,
	E extends GenericExpand
> extends TypedBaseQueryParams<T, S> {
	expand?: ExpandParam<T, E>;
}

export interface TypedRecordListQueryParams<
	T extends GenericCollection,
	S extends Fields<T>,
	E extends GenericExpand
> extends TypedListQueryParams<T, S>,
		TypedRecordQueryParams<T, S, E> {}

export interface TypedRecordFullListQueryParams<
	T extends GenericCollection,
	S extends Fields<T>,
	E extends GenericExpand
> extends TypedFullListQueryParams<T, S>,
		TypedRecordQueryParams<T, S, E> {}
