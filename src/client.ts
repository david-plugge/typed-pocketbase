import PocketBase, {
	ListResult,
	OAuth2AuthConfig,
	RecordAuthResponse,
	RecordOptions,
	RecordService,
	RecordSubscription,
	SendOptions,
	UnsubscribeFunc
} from 'pocketbase';
import {
	BaseRecord,
	GenericCollection,
	GenericSchema,
	MaybeArray,
	RecordWithExpandToDotPath
} from './types.js';
import {
	ResolveSelectWithExpand,
	SelectWithExpand,
	resolveSelect
} from './select.js';
import { Sort } from './sort.js';
import { Filter } from './filter.js';

export interface ViewCollectionService<
	Collection extends GenericCollection,
	ExpandedRecord extends BaseRecord = RecordWithExpandToDotPath<Collection>
> {
	collectionName: Collection['collectionName'];
	client: PocketBase;

	subscribe<TSelect extends SelectWithExpand<Collection> | undefined>(
		topic: string,
		callback: (
			data: RecordSubscription<
				ResolveSelectWithExpand<Collection, TSelect>
			>
		) => void,
		options?: {
			select?: TSelect;
		} & SendOptions
	): Promise<UnsubscribeFunc>;

	getFullList<TSelect extends SelectWithExpand<Collection> | undefined>(
		options?: {
			select?: TSelect;
			page?: number;
			perPage?: number;
			sort?: MaybeArray<Sort<ExpandedRecord>>;
			filter?: Filter<ExpandedRecord>;
		} & SendOptions
	): Promise<ResolveSelectWithExpand<Collection, TSelect>[]>;
	getList<TSelect extends SelectWithExpand<Collection>>(
		page?: number,
		perPage?: number,
		options?: {
			select?: TSelect;
			sort?: MaybeArray<Sort<ExpandedRecord>>;
			filter?: Filter<ExpandedRecord>;
		} & SendOptions
	): Promise<ListResult<ResolveSelectWithExpand<Collection, TSelect>>>;
	getFirstListItem<TSelect extends SelectWithExpand<Collection>>(
		filter: Filter<ExpandedRecord>,
		options?: {
			select?: TSelect;
			sort?: MaybeArray<Sort<ExpandedRecord>>;
		} & SendOptions
	): Promise<ResolveSelectWithExpand<Collection, TSelect>>;
	getOne<TSelect extends SelectWithExpand<Collection>>(
		id: string,
		options?: {
			select?: TSelect;
		} & SendOptions
	): Promise<ResolveSelectWithExpand<Collection, TSelect>>;

	createFilter(filter: Filter<ExpandedRecord>): Filter<ExpandedRecord>;

	createSort(...sort: Sort<ExpandedRecord>[]): Sort<ExpandedRecord>;

	createSelect<T extends SelectWithExpand<Collection>>(select: T): T;
}

export interface BaseCollectionService<Collection extends GenericCollection>
	extends ViewCollectionService<Collection> {
	create<TSelect extends SelectWithExpand<Collection>>(
		bodyParams: Collection['create'],
		options?: {
			select?: TSelect;
		} & SendOptions
	): Promise<ResolveSelectWithExpand<Collection, TSelect>>;
	update<TSelect extends SelectWithExpand<Collection>>(
		id: string,
		bodyParams: Collection['update'],
		options?: {
			select?: TSelect;
		} & SendOptions
	): Promise<ResolveSelectWithExpand<Collection, TSelect>>;
	delete(id: string): Promise<boolean>;
}

export interface AuthCollectionService<Collection extends GenericCollection>
	extends BaseCollectionService<Collection>,
		Pick<RecordService, (typeof FORWARD_METHODS)[number]> {
	authWithPassword<TSelect extends SelectWithExpand<Collection>>(
		usernameOrEmail: string,
		password: string,
		options?: {
			select?: TSelect;
		} & SendOptions
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
		options?: {
			select?: TSelect;
		} & SendOptions
	): Promise<
		RecordAuthResponse<ResolveSelectWithExpand<Collection, TSelect>>
	>;
	authWithOAuth2(
		options: Omit<OAuth2AuthConfig, 'createData'> & {
			createData?: Collection['create'];
		} & SendOptions
	): Promise<RecordAuthResponse<Collection['response']>>;
	authRefresh<TSelect extends SelectWithExpand<Collection>>(
		options?: {
			select?: TSelect;
		} & SendOptions
	): Promise<
		RecordAuthResponse<ResolveSelectWithExpand<Collection, TSelect>>
	>;
}

const FORWARD_METHODS = [
	'unsubscribe',

	'listAuthMethods',
	'requestPasswordReset',
	'confirmPasswordReset',
	'requestVerification',
	'confirmVerification',
	'requestEmailChange',
	'confirmEmailChange',
	'listExternalAuths',
	'unlinkExternalAuth'
] as const;

export class TypedRecordService
	implements BaseCollectionService<GenericCollection>
{
	constructor(readonly service: RecordService<any>) {
		for (const name of FORWARD_METHODS) {
			// @ts-ignore
			this[name] = this.service[name].bind(this.service);
		}
	}

	get client() {
		return this.service.client;
	}

	get collectionName() {
		return this.service.collectionIdOrName;
	}

	private prepareOptions({
		select,
		filter,
		sort,
		...options
	}: RecordOptions = {}): RecordOptions {
		const { expand, fields } = resolveSelect(select);

		if (fields) options.fields = fields;
		if (expand) options.expand = expand;
		if (Array.isArray(sort) && sort.length) {
			options.sort = sort.join(',');
		} else if (sort) {
			options.sort = sort;
		}

		return options;
	}

	createFilter(filter: string) {
		return filter ? filter : '';
	}

	createSort(...sorters: any[]): any {
		return sorters.filter((x) => typeof x === 'string').join(',');
	}

	createSelect(select: any) {
		return select;
	}

	subscribe(
		topic: string,
		callback: (data: RecordSubscription<any>) => void,
		options?: SendOptions
	): Promise<UnsubscribeFunc> {
		return this.service.subscribe(
			topic,
			callback,
			this.prepareOptions(options)
		);
	}

	getFullList(options?: SendOptions) {
		return this.service.getFullList(this.prepareOptions(options));
	}

	getList(page?: number, perPage?: number, options?: SendOptions) {
		return this.service.getList(
			page,
			perPage,
			this.prepareOptions(options)
		);
	}

	getFirstListItem(filter: string, options?: SendOptions) {
		return this.service.getFirstListItem(
			filter,
			this.prepareOptions(options)
		);
	}

	getOne(
		id: string,
		options?: {
			select?: any;
		} & SendOptions
	): Promise<any> {
		return this.service.getOne(id, this.prepareOptions(options));
	}

	create(
		bodyParams?:
			| {
					[key: string]: any;
			  }
			| FormData,
		options?: {
			select?: any;
		} & SendOptions
	) {
		return this.service.create(bodyParams, this.prepareOptions(options));
	}

	update(
		id: string,
		bodyParams?:
			| FormData
			| {
					[key: string]: any;
			  },
		options?: {
			select?: any;
		} & SendOptions
	) {
		return this.service.update(
			id,
			bodyParams,
			this.prepareOptions(options)
		);
	}

	delete(id: string, options?: SendOptions) {
		return this.service.delete(id, this.prepareOptions(options));
	}

	authWithPassword(
		usernameOrEmail: string,
		password: string,
		options?: RecordOptions | undefined
	) {
		return this.service.authWithPassword(
			usernameOrEmail,
			password,
			this.prepareOptions(options)
		);
	}

	authWithOAuth2Code(
		provider: string,
		code: string,
		codeVerifier: string,
		redirectUrl: string,
		createData?: { [key: string]: any } | undefined,
		options?: RecordOptions | undefined
	) {
		return this.service.authWithOAuth2Code(
			provider,
			code,
			codeVerifier,
			redirectUrl,
			createData,
			this.prepareOptions(options)
		);
	}

	authWithOAuth2(options: OAuth2AuthConfig): Promise<RecordAuthResponse> {
		return this.service.authWithOAuth2(options);
	}

	authRefresh(options?: RecordOptions | undefined) {
		return this.service.authRefresh(this.prepareOptions(options));
	}
}

export class TypedPocketBase<Schema extends GenericSchema> extends PocketBase {
	from<
		CollectionName extends keyof Schema,
		Collection extends GenericCollection = Schema[CollectionName]
	>(
		name: CollectionName
	): Collection['type'] extends 'view'
		? ViewCollectionService<Collection>
		: Collection['type'] extends 'base'
			? BaseCollectionService<Collection>
			: AuthCollectionService<Collection> {
		return new TypedRecordService(this.collection(name as string)) as any;
	}
}
