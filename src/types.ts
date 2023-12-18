export type Prettify<T> = T extends infer o ? { [K in keyof o]: o[K] } : never;
export type MaybeArray<T> = T | T[];
export type MaybeMakeArray<T, Out> = T extends any[] ? Out[] : Out;
export type ArrayInnerType<T> = T extends Array<infer V> ? V : T;
export type Values<T> = T[keyof T];
export type Overide<A, B> = Prettify<Omit<A, keyof B> & B>;
export type RemoveIndex<T> = {
	[K in keyof T as string extends K
		? never
		: number extends K
			? never
			: symbol extends K
				? never
				: K]: T[K];
};
export type LooseAutocomplete<T> = T | (string & {});
export type UnionToIntersection<T> = (
	T extends any ? (x: T) => any : never
) extends (x: infer R) => any
	? R
	: never;

export type BaseRecord = Record<string, any>;

export type BaseSystemFields = {
	id: string;
	created: string;
	updated: string;
};

export type GenericCollection = {
	type: string;
	collectionId: string;
	collectionName: string;
	response: BaseRecord;
	create?: BaseRecord;
	update?: BaseRecord;
	relations: Record<string, GenericCollection | GenericCollection[]>;
};

export type GenericSchema = {
	[K: string]: GenericCollection;
};

export type TypedRecord<
	Data extends BaseRecord,
	Expand extends GenericExpand = {}
> = Data & {
	expand: Expand;
};

export interface SystemFields {
	id: string;
	created: string;
	update: string;
}

export type BaseCollectionRecords = Record<string, BaseRecord>;

export type Fields<T extends GenericCollection> = keyof T['response'];
export type Columns<T extends GenericCollection> = T['response'];

export type Expands<T extends GenericCollection> = {
	[K in keyof T['relations']]?: T['relations'][K] extends GenericCollection[]
		? TypedRecord<
				T['relations'][K][number],
				Expands<T['relations'][K][number]>
			>[]
		: T['relations'][K] extends GenericCollection
			? TypedRecord<T['relations'][K], Expands<T['relations'][K]>>
			: never;
};

export type GenericExpand = Record<
	string,
	TypedRecord<any> | TypedRecord<any>[]
>;

type JoinPath<Parts extends string[]> = Parts extends [
	infer A extends string,
	...infer Rest extends string[]
]
	? Rest['length'] extends 0
		? A
		: `${A}.${JoinPath<Rest>}`
	: never;

type _RecordWithExpandToDotPath<
	T extends GenericCollection,
	Path extends string[] = []
> = {
	[K in keyof T['response'] as JoinPath<
		[...Path, K & string]
	>]: T['response'][K];
} & (Path['length'] extends 4 // Supports up to 6-levels depth nested relations expansion.
	? {}
	: UnionToIntersection<
			Values<{
				[K in keyof T['relations']]: _RecordWithExpandToDotPath<
					ArrayInnerType<T['relations'][K]>,
					[...Path, K & string]
				>;
			}>
		>);

export type RecordWithExpandToDotPath<T extends GenericCollection> = Prettify<
	_RecordWithExpandToDotPath<T>
>;
