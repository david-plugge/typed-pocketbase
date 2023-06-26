import {
	TypedRecord,
	GenericCollection,
	GenericExpand,
	ArrayInnerType,
	Simplify
} from './types.js';

export type ExpandParam<
	T extends GenericCollection,
	E extends GenericExpand
> = {
	__record__?: T;
	__expand__?: E;
} & string;

export type Expand<T extends GenericCollection> = {
	[K in keyof T['relations']]?:
		| true
		| Expand<ArrayInnerType<T['relations'][K]>>;
};

type RelationToTypedRecord<
	T extends GenericCollection | GenericCollection[],
	E extends GenericExpand = {}
> = T extends GenericCollection[]
	? TypedRecord<T[number]['response'], E>[]
	: T extends GenericCollection
	? TypedRecord<T['response'], E>
	: never;

export type UnpackExpand<
	T extends GenericCollection,
	E extends Expand<T>
> = Simplify<{
	[K in keyof E & keyof T['relations']]: RelationToTypedRecord<
		T['relations'][K],
		E[K] extends Expand<GenericCollection>
			? UnpackExpand<ArrayInnerType<T['relations'][K]>, E[K]>
			: {}
	>;
}>;

export function expand<T extends GenericCollection, E extends Expand<T>>(
	expand: E
): ExpandParam<T, UnpackExpand<T, E>> {
	const expands: string[] = [];

	process(expand);

	function process(obj: any, prefix: string[] = []) {
		for (const key in obj) {
			const value = obj[key];
			if (value === true) {
				expands.push([...prefix, key].join('.'));
			} else if (typeof value === 'object') {
				process(value, [...prefix, key]);
			}
		}
	}

	return [...new Set(expands)].join(',');
}
