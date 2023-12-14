import PocketBase from 'pocketbase';
import { Collection, Field } from './types.js';

export interface GenerateOptions {
	url: string;
	email: string;
	password: string;
}

interface Columns {
	create: string[];
	update: string[];
	response: string[];
}

interface Relation {
	name: string;
	target: string;
}

export async function generateTypes({ url, email, password }: GenerateOptions) {
	const pb = new PocketBase(url);
	await pb.admins.authWithPassword(email, password);

	const collections = await pb.collections
		.getFullList()
		.then((collections) =>
			collections.map((c) => c.export() as Collection)
		);

	const deferred: Array<() => void> = [];

	const tables = collections.map((c) => {
		const typeName = pascalCase(c.name);

		const columns: Columns = {
			create: [],
			update: [],
			response: []
		};
		const relations: Relation[] = [];

		c.schema.forEach((field) => {
			getFieldType(field, columns);

			if (field.type === 'relation') {
				deferred.push(() => {
					const target = tableMap.get(field.options.collectionId);
					const targetCollection = collectionMap.get(
						field.options.collectionId
					);

					if (!target || !targetCollection)
						throw new Error(
							`Collection ${field.options.collectionId} not found for relation ${c.name}.${field.name}`
						);

					relations.push({
						name: field.name,
						target: `${target.typeName}Collection${
							field.options.maxSelect === 1 ? '' : '[]'
						}`
					});

					/**
					 * indirect expand
					 * @see https://pocketbase.io/docs/expanding-relations/#indirect-expand
					 */

					const indicies = targetCollection.indexes.map(parseIndex);

					const isUnique = indicies.some(
						(i) =>
							i &&
							i.unique &&
							i.fields.length === 1 &&
							i.fields[0] === field.name
					);

					target.relations.push({
						name: `'${c.name}(${field.name})'`,
						target: `${typeName}Collection${isUnique ? '' : '[]'}`
					});
				});
			}
		});

		return {
			id: c.id,
			name: c.name,
			type: c.type,
			typeName,
			columns,
			relations
		};
	});

	const tableMap = new Map(tables.map((t) => [t.id, t]));
	const collectionMap = new Map(collections.map((c) => [c.id, c]));

	deferred.forEach((c) => c());

	const indent = '\t';

	const definition = `
/**
 * This file was @generated using typed-pocketbase
 */

// https://pocketbase.io/docs/collections/#base-collection
type BaseCollectionRecord = {
	id: string;
	created: string;
	updated: string;
};

// https://pocketbase.io/docs/collections/#auth-collection
type AuthCollectionRecord = {
	id: string;
	created: string;
	updated: string;
	username: string;
	email: string;
	emailVisibility: boolean;
	verified: boolean;
};

// https://pocketbase.io/docs/collections/#view-collection
type ViewCollectionRecord = {
	id: string;
};

// utilities

type MaybeArray<T> = T | T[];

${tables
	.map((t) =>
		`
// ===== ${t.name} =====

export type ${t.typeName}Response = {
	${t.columns.response.join('\n' + indent)}
} & ${
			t.type === 'base'
				? 'BaseCollectionRecord'
				: t.type === 'auth'
					? 'AuthCollectionRecord'
					: 'ViewCollectionRecord'
		};
${
	// view collections are readonly
	t.type === 'view'
		? ''
		: `
export type ${t.typeName}Create = {
	${t.columns.create.join('\n' + indent)}
};

export type ${t.typeName}Update = {
	${t.columns.update.join('\n' + indent)}
};
`
}
export type ${t.typeName}Collection = {
	type: '${t.type}';
	collectionId: '${t.id}';
	collectionName: '${t.name}';
	response: ${t.typeName}Response;${
		t.type === 'view'
			? ''
			: `
	create: ${t.typeName}Create;
	update: ${t.typeName}Update;`
	}
	relations: ${
		t.relations.length === 0
			? '{}'
			: `{
		${t.relations
			.map((col) => `${col.name}: ${col.target};`)
			.join('\n' + ' '.repeat(8))}
	}`
	};
};

`.trim()
	)
	.join('\n\n')}

// ===== Schema =====

export type Schema = {
	${tables
		.map(({ name, typeName }) => `${name}: ${typeName}Collection;`)
		.join('\n' + indent)}
};
`.trim();

	return definition;
}

function getFieldType(field: Field, { response, create, update }: Columns) {
	const req = field.required ? '' : '?';

	const addResponse = (type: string, name = field.name) =>
		response.push(`${name}${req}: ${type};`);
	const addCreate = (type: string, name = field.name) =>
		create.push(`${name}${req}: ${type};`);
	const addUpdate = (type: string, name = field.name) =>
		update.push(`${name}?: ${type};`);
	const addAll = (type: string) => {
		addResponse(type);
		addCreate(type);
		addUpdate(type);
	};

	switch (field.type) {
		case 'text':
		case 'editor': // rich text
		case 'email': {
			addAll('string');
			break;
		}
		case 'url': {
			addCreate('string | URL');
			addUpdate('string | URL');
			addResponse('string');
			break;
		}
		case 'date': {
			addCreate('string | Date');
			addUpdate('string | Date');
			addResponse('string');
			break;
		}
		case 'number': {
			const type = 'number';
			addAll(type);
			addUpdate(type, `'${field.name}+'`);
			addUpdate(type, `'${field.name}-'`);
			break;
		}
		case 'bool': {
			addAll('boolean');
			break;
		}
		case 'select': {
			const singleType = field.options.values
				.map((v) => `'${v}'`)
				.join(' | ');
			const single = field.options.maxSelect === 1;
			const type = single ? `${singleType}` : `MaybeArray<${singleType}>`;

			addResponse(single ? singleType : `Array<${singleType}>`);
			addCreate(type);
			addUpdate(type);
			if (!single) {
				addUpdate(type, `'${field.name}+'`);
				addUpdate(type, `'${field.name}-'`);
			}

			break;
		}
		case 'relation': {
			const singleType = 'string';
			const single = field.options.maxSelect === 1;
			const type = single ? `${singleType}` : `MaybeArray<${singleType}>`;

			addResponse(single ? singleType : `Array<${singleType}>`);
			addCreate(type);
			addUpdate(type);
			if (!single) {
				addUpdate(type, `'${field.name}+'`);
				addUpdate(type, `'${field.name}-'`);
			}
			break;
		}
		case 'file': {
			const singleType = 'string';
			const single = field.options.maxSelect === 1;
			const type = single ? `${singleType}` : `MaybeArray<${singleType}>`;

			addResponse(single ? singleType : `Array<${singleType}>`);
			addCreate(type);
			addUpdate(type);
			if (!single) {
				addUpdate(type, `'${field.name}-'`);
			}
			break;
		}
		case 'json': {
			addAll('any');
			break;
		}
		default:
			console.warn(`Unknown type ${(field as { type: string }).type}.`);
			console.warn(
				`Feel free to open an issue about this warning https://github.com/david-plugge/typed-pocketbase/issues.`
			);
			addAll('unknown');
	}
}

function parseIndex(index: string) {
	const match = index.match(
		/^CREATE(\s+UNIQUE)?\s+INDEX\s+`(\w+)`\s+ON\s+`(\w+)`\s+\(([\s\S]*)\)$/
	);
	if (!match) return null;
	const [_, unique, name, collection, definition] = match;

	const fields = Array.from(definition.matchAll(/`(\S*)`/g)).map((m) => m[1]);

	return {
		unique: !!unique,
		name,
		collection,
		fields
	};
}

function pascalCase(str: string) {
	return str
		.replace(/[-_]([a-z])/g, (m) => m[1].toUpperCase())
		.replace(/^\w/, (s) => s.toUpperCase());
}
