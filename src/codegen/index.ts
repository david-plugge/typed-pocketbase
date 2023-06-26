import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import PocketBase, { SchemaField } from 'pocketbase';
import sade from 'sade';

type Column = {
	name: string;
	type: string;
	required: boolean;
};
type Relation = {
	name: string;
	target: unknown | unknown[];
};
type File = {
	name: string;
	thumbs: [];
};
type CollectionType = 'auth' | 'view' | 'base';

interface Collection {
	id: string;
	name: string;
	type: CollectionType;

	typeName: string;

	columns: Column[];
	relations: Relation[];
	files: File[];
}

interface CliOptions {
	url: string;
	email: string;
	password: string;
	out?: string;
}

sade(PKG_NAME, true)
	.version(PKG_VERSION)
	.describe('Generate types for the PocketBase JavaScript SDK')
	.option(
		'-u, --url',
		'URL to your hosted pocketbase instance.',
		'http://127.0.0.1:8090'
	)
	.option('-e, --email', 'email for an admin pocketbase user.')
	.option('-p, --password', 'email for an admin pocketbase user.')
	.option(
		'-o, --out',
		'path to save the typescript output file (prints to console by default)'
	)
	.action(
		({
			url,
			email = process.env.POCKETBASE_EMAIL,
			password = process.env.POCKETBASE_PASSWORD,
			out
		}: Partial<CliOptions>) => {
			if (!url) error(`required option '-u, --url' not specified`);

			if (!email)
				error(
					`required option '-e, --email' not specified and 'POCKETBASE_EMAIL' env not set`
				);

			if (!password)
				error(
					`required option '-p, --password' not specified and 'POCKETBASE_PASSWORD' env not set`
				);

			generateTypes({
				url,
				email,
				password,
				out
			});
		}
	)
	.parse(process.argv);

function error(msg: string): never {
	console.error(msg);
	process.exit();
}

async function generateTypes({ url, email, password, out }: CliOptions) {
	const pb = new PocketBase(url);
	await pb.admins.authWithPassword(email, password);

	const collections = await pb.collections.getFullList();

	const deferred: Array<() => void> = [];

	const tables = collections.map<Collection>((c) => {
		const columns: Column[] = [];
		const files: File[] = [];
		const relations: Relation[] = [];
		const typeName = pascalCase(c.name);

		c.schema.forEach((field) => {
			columns.push({
				name: field.name,
				required: field.required,
				type: getFieldType(field)
			});

			if (field.type === 'file') {
				files.push({
					name: field.name,
					thumbs:
						field.options.thumbs
							?.map((t: string) => `'${t}'`)
							.join(' | ') ?? 'never'
				});
			}

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
							field.options.maxSelect > 1 ? '[]' : ''
						}`
					});

					/**
					 * indirect expand
					 * @see https://pocketbase.io/docs/expanding-relations/#indirect-expand
					 */

					const reg = new RegExp(
						`CREATE UNIQUE INDEX \`idx_rdMGJaq\` ON \`${c.name}\` \\(\`${field.name}\`\\)`
						// `CREATE UNIQUE INDEX \`(\\w+)\` ON \`${c.name}\` (\`${field.name}\`)`
					);

					const isUnique = targetCollection.indexes.some((index) =>
						reg.test(index)
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
			type: c.type as CollectionType,
			typeName,
			columns,
			files,
			relations
		};
	});

	const tableMap = new Map(tables.map((t) => [t.id, t]));
	const collectionMap = new Map(collections.map((c) => [c.id, c]));

	deferred.forEach((c) => c());

	const definition =
		`
export type BaseSystemFields<T> = {
	id: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: T;
};

export type AuthSystemFields<T> = {
	email: string;
	emailVisibility: boolean;
	username: string;
	verified: boolean;
} & BaseSystemFields<T>;

${tables
	.map(({ id, name, type, typeName, columns, files, relations }) =>
		`
export type ${typeName}Record = {
    ${columns
		.map((col) =>
			`${col.name}${col.required ? '' : '?'}: ${col.type};`.trim()
		)
		.join('\n' + ' '.repeat(4))}
}

export type ${typeName}Response = ${typeName}Record & ${
			type === 'auth' ? 'AuthSystemFields' : 'BaseSystemFields'
		}<'${name}'>

export type ${typeName}Collection = {
    collectionId: '${id}';
    collectionName: '${name}';
    record: ${typeName}Record;
    response: ${typeName}Response;
    files: {
        ${files
			.map((col) => `${col.name}: { thumbs: ${col.thumbs} };`.trim())
			.join('\n' + ' '.repeat(8))}
    };
    relations: {
        ${relations
			.map((col) => `${col.name}: ${col.target};`.trim())
			.join('\n' + ' '.repeat(8))}
    };
};
`.trim()
	)
	.join('\n\n')}

export type Schema = {
    ${tables
		.map(({ name, typeName }) => `${name}: ${typeName}Collection;`)
		.join('\n    ')}
};


    `.trim() + '\n';

	if (out) {
		const file = resolve(out);
		await mkdir(dirname(file), { recursive: true });
		await writeFile(file, definition, 'utf-8');
	} else {
		console.log(definition);
	}
}

function getFieldType(schema: SchemaField) {
	switch (schema.type) {
		case 'text':
		case 'date':
		case 'editor': // rich text
		case 'relation':
		case 'file':
			return 'string';
		case 'bool':
			return 'boolean';
	}
	throw new Error(`Unknown type ${schema.type}`);
}

function pascalCase(str: string) {
	return str
		.replace(/[-_]([a-z])/g, (m) => m[1].toUpperCase())
		.replace(/^\w/, (s) => s.toUpperCase());
}
