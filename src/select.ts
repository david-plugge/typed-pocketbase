import {
	ArrayInnerType,
	GenericCollection,
	MaybeMakeArray,
	Prettify
} from './types.js';

export type Select<Collection extends GenericCollection> = {
	[K in keyof Collection['response']]?: boolean;
};

export type SelectWithExpand<Collection extends GenericCollection> =
	Select<Collection> & {
		expand?: {
			[K in keyof Collection['relations']]?:
				| SelectWithExpand<ArrayInnerType<Collection['relations'][K]>>
				| boolean;
		};
	};

export type ResolveSelect<
	TCollection extends GenericCollection,
	TSelect extends Select<TCollection> | undefined
> =
	Extract<keyof TSelect, keyof TCollection['response']> extends never
		? TCollection['response']
		: {
				[K in keyof TSelect &
					keyof TCollection['response'] as TSelect[K] extends true
					? K
					: never]: TCollection['response'][K];
			};

export type ResolveSelectWithExpand<
	TCollection extends GenericCollection,
	TSelect extends Select<TCollection> | undefined
> = Prettify<
	ResolveSelect<TCollection, TSelect> &
		('expand' extends keyof TSelect
			? {
					expand?: {
						[Relation in keyof TSelect['expand'] &
							keyof TCollection['relations'] as TSelect['expand'][Relation] extends false
							? never
							: Relation]?: TSelect['expand'][Relation] extends true
							? MaybeMakeArray<
									TCollection['relations'][Relation],
									ArrayInnerType<
										TCollection['relations'][Relation]
									>['response']
								>
							: TSelect['expand'][Relation] extends object
								? MaybeMakeArray<
										TCollection['relations'][Relation],
										ResolveSelectWithExpand<
											ArrayInnerType<
												TCollection['relations'][Relation]
											>,
											TSelect['expand'][Relation]
										>
									>
								: never;
					};
				}
			: {})
>;

export function resolveSelect(select: any) {
	const fieldList: string[] = [];
	const expandList: string[] = [];

	if (select) {
		(function recurse(
			{ expand, ...rest }: SelectWithExpand<any>,
			fieldsParent: string[] = [],
			expandParent: string[] = []
		) {
			if (Object.keys(rest).length === 0) {
				fieldList.push([...fieldsParent, '*'].join('.'));
			} else {
				for (const key in rest) {
					if (rest[key]) {
						fieldList.push([...fieldsParent, key].join('.'));
					}
				}
			}

			if (expand) {
				for (const key in expand) {
					const sub = expand[key];
					if (sub === true) {
						expandList.push([...expandParent, key].join('.'));
						fieldList.push(
							[...fieldsParent, 'expand', key, '*'].join('.')
						);
					} else if (sub) {
						expandList.push([...expandParent, key].join('.'));
						recurse(
							sub,
							[...fieldsParent, 'expand', key],
							[...expandParent, key]
						);
					}
				}
			}
		})(select);
	} else {
		fieldList.push('*');
	}

	return {
		fields: fieldList.join(','),
		expand: expandList.join(',')
	};
}
