import { FilterParam } from './filter.js';
import { Sort } from './sort.js';
import {
	ArrayInnerType,
	GenericCollection,
	MaybeArray,
	MaybeMakeArray,
	Prettify,
	RecordWithExpandToDotPath
} from './types.js';

export type Select<Collection extends GenericCollection> = {
	[K in keyof Collection['response']]?: boolean;
};

export type SelectWithExpand<Collection extends GenericCollection> =
	Select<Collection> & {
		$expand?: {
			[K in keyof Collection['relations']]?:
				| SelectWithExpand<ArrayInnerType<Collection['relations'][K]>>
				| boolean;
		};
	};

export type ResolveSelect<
	TCollection extends GenericCollection,
	TSelect extends Select<TCollection>
> = Extract<keyof TSelect, keyof TCollection['response']> extends never
	? TCollection['response']
	: {
			[K in keyof TSelect &
				keyof TCollection['response'] as TSelect[K] extends true
				? K
				: never]: TCollection['response'][K];
		};

export type ResolveSelectWithExpand<
	TCollection extends GenericCollection,
	TSelect extends Select<TCollection>
> = Prettify<
	ResolveSelect<TCollection, TSelect> &
		('$expand' extends keyof TSelect
			? {
					expand: {
						[Relation in keyof TSelect['$expand'] &
							keyof TCollection['relations'] as TSelect['$expand'][Relation] extends false
							? never
							: Relation]: TSelect['$expand'][Relation] extends true
							? MaybeMakeArray<
									TCollection['relations'][Relation],
									ArrayInnerType<
										TCollection['relations'][Relation]
									>['response']
								>
							: TSelect['$expand'][Relation] extends object
								? MaybeMakeArray<
										TCollection['relations'][Relation],
										ResolveSelectWithExpand<
											ArrayInnerType<
												TCollection['relations'][Relation]
											>,
											TSelect['$expand'][Relation]
										>
									>
								: never;
					};
				}
			: {})
>;

export interface CreateOptions {
	<
		TCollection extends GenericCollection,
		TSelect extends SelectWithExpand<TCollection>
	>(
		options: TypedRecordFullListQueryParams<TCollection, TSelect>
	): TypedRecordFullListQueryParams<TCollection, TSelect>;
	<
		TCollection extends GenericCollection,
		TSelect extends SelectWithExpand<TCollection>
	>(
		options: TypedRecordListQueryParams<TCollection, TSelect>
	): TypedRecordListQueryParams<TCollection, TSelect>;
	<
		TCollection extends GenericCollection,
		TSelect extends SelectWithExpand<TCollection>
	>(
		options: TypedRecordQueryParams<TSelect>
	): TypedRecordQueryParams<TSelect>;
}

export const createOptions: CreateOptions = (options) => {
	const fields: string[] = [];
	const expand: string[] = [];

	if (options.select) {
		(function recurse(
			{ $expand, ...rest }: SelectWithExpand<any>,
			parent: string[] = []
		) {
			if (Object.keys(rest).length === 0) {
				fields.push([...parent, '*'].join('.'));
			} else {
				for (const key in rest) {
					if (rest[key]) {
						fields.push([...parent, key].join('.'));
					}
				}
			}

			if ($expand) {
				for (const key in $expand) {
					const sub = $expand[key];
					if (sub === true) {
						expand.push([...parent, key].join('.'));
						fields.push([...parent, 'expand', key, '*'].join('.'));
					} else if (sub) {
						expand.push([...parent, key].join('.'));
						recurse(sub, [...parent, 'expand', key]);
					}
				}
			}
		})(options.select);
	} else {
		fields.push('*');
	}

	let { sort } = options as any;
	if (Array.isArray(sort)) {
		sort = sort.join(',');
	}

	return {
		...options,
		fields: fields.join(','),
		expand: expand.join(','),
		sort
	};
};

export interface TypedBaseQueryParams<TSelect> {
	select?: TSelect;
	requestKey?: string | null;
	/**
	 * @deprecated use `requestKey:null` instead
	 */
	$autoCancel?: boolean;
	/**
	 * @deprecated use `requestKey:string` instead
	 */
	$cancelKey?: string;
}

export interface TypedListQueryParams<
	TCollection extends GenericCollection,
	TSelect
> extends TypedBaseQueryParams<TSelect> {
	page?: number;
	perPage?: number;
	sort?: MaybeArray<Sort<TCollection>>;
	filter?: FilterParam<RecordWithExpandToDotPath<TCollection>>;
}

export interface TypedFullListQueryParams<
	TCollection extends GenericCollection,
	TSelect
> extends TypedListQueryParams<TCollection, TSelect> {
	batch?: number;
}

export interface TypedRecordQueryParams<TSelect>
	extends TypedBaseQueryParams<TSelect> {
	select?: TSelect;
}

export interface TypedRecordListQueryParams<
	TCollection extends GenericCollection,
	TSelect
> extends TypedListQueryParams<TCollection, TSelect>,
		TypedRecordQueryParams<TSelect> {}

export interface TypedRecordFullListQueryParams<
	TCollection extends GenericCollection,
	TSelect
> extends TypedFullListQueryParams<TCollection, TSelect>,
		TypedRecordQueryParams<TSelect> {}
