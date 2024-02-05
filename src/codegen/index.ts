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
	target: CollectionDefinition;
	unique: boolean;
}

interface CollectionDefinition {
	id: string;
	name: string;
	type: Collection['type'];
	typeName: string;
	columns: Columns;
	relations: Relation[];
}

export async function generateTypes({ url, email, password }: GenerateOptions) {
	const pb = new PocketBase(url);
	await pb.admins.authWithPassword(email, password);

	const collections = await pb.collections.getFullList<Collection>();
	const definitions = buildCollectionDefinitions(collections);

	const definition = `/**
 * This file was @generated using typed-pocketbase
 */

// https://pocketbase.io/docs/collections/#base-collection
export interface BaseCollectionResponse {
	/**
	 * 15 characters string to store as record ID.
	 */
	id: string;
	/**
	 * Date string representation for the creation date.
	 */
	created: string;
	/**
	 * Date string representation for the creation date.
	 */
	updated: string;
	/**
	 * The collection id.
	 */
	collectionId: string;
	/**
	 * The collection name.
	 */
	collectionName: string;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface BaseCollectionCreate {
	/**
	 * 15 characters string to store as record ID.
	 * If not set, it will be auto generated.
	 */
	id?: string;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface BaseCollectionUpdate {}

// https://pocketbase.io/docs/collections/#auth-collection
export interface AuthCollectionResponse extends BaseCollectionResponse {
	/**
	 * The username of the auth record.
	 */
	username: string;
	/**
	 * Auth record email address.
	 */
	email: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility: boolean;
	/**
	 * Indicates whether the auth record is verified or not.
	 */
	verified: boolean;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface AuthCollectionCreate extends BaseCollectionCreate {
	/**
	 * The username of the auth record.
	 * If not set, it will be auto generated.
	 */
	username?: string;
	/**
	 * Auth record email address.
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Auth record password.
	 */
	password: string;
	/**
	 * Auth record password confirmation.
	 */
	passwordConfirm: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface AuthCollectionUpdate {
	/**
	 * The username of the auth record.
	 */
	username?: string;
	/**
	 * The auth record email address.
	 * This field can be updated only by admins or auth records with "Manage" access.
	 * Regular accounts can update their email by calling "Request email change".
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Old auth record password.
	 * This field is required only when changing the record password. Admins and auth records with "Manage" access can skip this field.
	 */
	oldPassword?: string;
	/**
	 * New auth record password.
	 */
	password: string;
	/**
	 * New auth record password confirmation.
	 */
	passwordConfirm: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/collections/#view-collection
export interface ViewCollectionRecord {
	id: string;
}

// utilities

type MaybeArray<T> = T | T[];

${definitions.map(createCollectionTypes).join('\n\n')}

// ===== Schema =====

export type Schema = {
	${definitions
		.map(({ name }) => `${name}: ${pascalCase(name)}Collection;`)
		.join(`\n\t`)}
};`;

	return definition;
}

function createCollectionTypes({
	name,
	relations,
	columns,
	type,
	typeName
}: CollectionDefinition) {
	const prefix = pascalCase(type);
	const base = `${prefix}Collection`;

	let out = `// ===== ${name} =====`;

	const { response, create, update } = columns;

	const responseColumns = [`collectionName: '${name}';`, ...response];

	out += `\n\nexport interface ${typeName}Response extends ${base}Response {\n\t${responseColumns.join(
		`\n\t`
	)}\n}`;

	if (type !== 'view') {
		const createBody = create.length
			? `{\n\t${create.join(`\n\t`)}\n}`
			: '{}';

		out += `\n\nexport interface ${typeName}Create extends ${base}Create ${createBody}`;

		const updateBody = update.length
			? `{\n\t${update.join(`\n\t`)}\n}`
			: '{}';

		out += `\n\nexport interface ${typeName}Update extends ${base}Update ${updateBody}`;
	}

	const createRelations = () => {
		return relations
			.map(
				(r) =>
					`${/^\w+$/.test(r.name) ? r.name : `'${r.name}'`}: ${
						r.target.typeName
					}Collection${r.unique ? '' : '[]'};`
			)
			.join('\n\t\t');
	};

	const collectionBody = [
		`type: '${type}';`,
		`collectionId: string;`,
		`collectionName: '${name}';`,
		`response: ${typeName}Response;`,
		type !== 'view' && `create: ${typeName}Create;`,
		type !== 'view' && `update: ${typeName}Update;`,
		`relations: ${
			relations.length === 0
				? 'Record<string, never>;'
				: `{\n\t\t${createRelations()}\n\t};`
		}`
	].filter(Boolean);

	out += `\n\nexport interface ${typeName}Collection {
	${collectionBody.join('\n\t')}
}`;

	return out;
}

function buildCollectionDefinitions(collections: Collection[]) {
	const deferred: Array<() => void> = [];
	const definitions = new Map<string, CollectionDefinition>();

	for (const collection of collections) {
		const columns: Columns = {
			create: [],
			update: [],
			response: []
		};
		const relations: Relation[] = [];

		for (const field of collection.schema) {
			getFieldType(field, columns);

			if (field.type === 'relation') {
				deferred.push(() => {
					const from = definitions.get(collection.id);
					const target = definitions.get(field.options.collectionId);

					if (!from)
						throw new Error(
							`Collection ${collection.id} not found for relation ${collection.name}.${field.name}`
						);
					if (!target)
						throw new Error(
							`Collection ${field.options.collectionId} not found for relation ${collection.name}.${field.name}`
						);

					relations.push({
						name: field.name,
						target,
						unique: field.options.maxSelect === 1
					});

					/**
					 * indirect expand
					 * @see https://pocketbase.io/docs/expanding-relations/#indirect-expand
					 */

					const indicies = collection.indexes.map(parseIndex);

					const isUnique = indicies.some(
						(index) =>
							index &&
							index.unique &&
							index.fields.length === 1 &&
							index.fields[0] === field.name
					);

					target.relations.push({
						name: `${collection.name}(${field.name})`,
						target: from,
						unique: isUnique
					});
				});
			}
		}

		definitions.set(collection.id, {
			id: collection.id,
			name: collection.name,
			type: collection.type,
			columns,
			relations,
			typeName: pascalCase(collection.name)
		});
	}

	deferred.forEach((c) => c());

	return Array.from(definitions.values());
}

function getFieldType(field: Field, { response, create, update }: Columns) {
	const addResponse = (type: string, name = field.name) =>
		response.push(`${name}: ${type};`);
	const addCreate = (type: string, name = field.name) =>
		create.push(`${name}${field.required ? '' : '?'}: ${type};`);
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
			const single = field.options.maxSelect === 1;
			const values =
				!field.required && single
					? ['', ...field.options.values]
					: field.options.values;
			const singleType = values.map((v) => `'${v}'`).join(' | ');
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
			const type = single ? singleType : `MaybeArray<${singleType}>`;

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
			const single = field.options.maxSelect === 1;

			addResponse(single ? 'string' : `Array<string>`);
			addCreate(single ? `File` : `MaybeArray<File>`);
			addUpdate(single ? `File` : `MaybeArray<File>`);
			if (!single) {
				addUpdate('string', `'${field.name}-'`);
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
