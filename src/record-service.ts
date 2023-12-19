import { ListResult, RecordAuthResponse, RecordService } from 'pocketbase';
import { GenericCollection } from './types.js';
import { Filter } from './filter.js';
import {
	ResolveSelectWithExpand,
	SelectWithExpand,
	TypedRecordFullListQueryParams,
	TypedRecordListQueryParams,
	TypedRecordQueryParams
} from './queryParams.js';

// @ts-expect-error
export interface TypedRecordService<Collection extends GenericCollection>
	extends RecordService<Collection['response']> {
	getFullList<TSelect extends SelectWithExpand<Collection>>(
		options?: TypedRecordFullListQueryParams<Collection, TSelect>
	): Promise<ResolveSelectWithExpand<Collection, TSelect>[]>;
	getFullList<TSelect extends SelectWithExpand<Collection>>(
		batch?: number,
		options?: TypedRecordListQueryParams<Collection, TSelect>
	): Promise<ResolveSelectWithExpand<Collection, TSelect>[]>;

	getList<TSelect extends SelectWithExpand<Collection>>(
		page?: number,
		perPage?: number,
		options?: TypedRecordListQueryParams<Collection, TSelect>
	): Promise<ListResult<ResolveSelectWithExpand<Collection, TSelect>>>;

	getFirstListItem<TSelect extends SelectWithExpand<Collection>>(
		filter: Filter<Collection>,
		options?: TypedRecordListQueryParams<Collection, TSelect>
	): Promise<ResolveSelectWithExpand<Collection, TSelect>>;

	getOne<TSelect extends SelectWithExpand<Collection>>(
		id: string,
		options?: TypedRecordQueryParams<TSelect>
	): Promise<ResolveSelectWithExpand<Collection, TSelect>>;

	create<TSelect extends SelectWithExpand<Collection>>(
		bodyParams: Collection['create'],
		options?: TypedRecordQueryParams<TSelect>
	): Promise<ResolveSelectWithExpand<Collection, TSelect>>;

	update<TSelect extends SelectWithExpand<Collection>>(
		id: string,
		bodyParams: Collection['update'],
		options?: TypedRecordQueryParams<TSelect>
	): Promise<ResolveSelectWithExpand<Collection, TSelect>>;

	// ===== AUTH =====
	authWithPassword<TSelect extends SelectWithExpand<Collection>>(
		usernameOrEmail: string,
		password: string,
		options?: TypedRecordQueryParams<TSelect>
	): Promise<
		RecordAuthResponse<ResolveSelectWithExpand<Collection, TSelect>>
	>;

	authWithOAuth2Code<TSelect extends SelectWithExpand<Collection>>(
		provider: string,
		code: string,
		codeVerifier: string,
		redirectUrl: string,
		createData?: {
			[key: string]: any;
		},
		options?: TypedRecordQueryParams<TSelect>
	): Promise<
		RecordAuthResponse<ResolveSelectWithExpand<Collection, TSelect>>
	>;

	authWithOAuth2<TSelect extends SelectWithExpand<Collection>>(
		provider: string,
		code: string,
		codeVerifier: string,
		redirectUrl: string,
		createData?: {
			[key: string]: any;
		},
		bodyParams?: {
			[key: string]: any;
		},
		options?: TypedRecordQueryParams<TSelect>
	): Promise<
		RecordAuthResponse<ResolveSelectWithExpand<Collection, TSelect>>
	>;

	authRefresh<TSelect extends SelectWithExpand<Collection>>(
		options?: TypedRecordQueryParams<TSelect>
	): Promise<
		RecordAuthResponse<ResolveSelectWithExpand<Collection, TSelect>>
	>;
}
