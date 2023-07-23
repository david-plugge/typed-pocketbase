import PocketBase from 'pocketbase';
import { z } from 'zod';
import { Collection, Field } from './types.js';
import { pascalCase } from './utils.js';

const db = new PocketBase('http://localhost:8090');
await db.admins.authWithPassword('test@test.com', 'secretpassword');

const def = await generateZod(db);
console.log(def);

export async function generateZod(pb: PocketBase) {
	const collections = await pb.collections
		.getFullList()
		.then((collections) =>
			collections.map((c) => c.export() as Collection)
		);

	const schemas = collections.map((c) => {
		const typeName = pascalCase(c.name);

		const fields = c.schema
			.map((field) => `\t${field.name}: ${getZodType(field)},`)
			.join('\n');

		return `export const ${pascalCase(
			typeName
		)}Schema = z.object({\n${fields}\n});`;
	});

	const definition = `

import { z } from 'zod';

${schemas.join('\n\n')}

    `.trim();

	return definition;
}

function getZodType(field: Field) {
	const def: (string | false)[] = ['z'];

	switch (field.type) {
		case 'text':
			def.push(
				'string()',
				typeof field.options.min === 'number' &&
					`min(${field.options.min})`,
				typeof field.options.max === 'number' &&
					`max(${field.options.max})`,
				!!field.options.pattern && `regex(/${field.options.pattern}/)`
			);
			break;
		case 'editor':
			def.push('string()');
			break;
		case 'email':
			def.push('string()', 'email()');
			break;
		case 'url':
			def.push('string()', 'url()');
			break;
		case 'date':
			def.push(
				'coerce',
				'date()',
				typeof field.options.min === 'number' &&
					`min(new Date(${field.options.min}))`,
				typeof field.options.max === 'number' &&
					`max(new Date(${field.options.max}))`
			);
			break;
		case 'number':
			def.push(
				'number()',
				typeof field.options.min === 'number' &&
					`min(${field.options.min})`,
				typeof field.options.max === 'number' &&
					`max(${field.options.max})`
			);
			break;
		case 'bool':
			if (field.required) {
				def.push('literal(true)');
			} else {
				def.push('boolean()');
			}
			break;
		case 'select':
			def.push(`enum(${JSON.stringify(field.options.values)})`);
			if (field.options.maxSelect !== 1) {
				def.push('array()', `max(${field.options.maxSelect})`);
			}
			break;
		case 'relation':
			def.push('string()');
			if (field.options.maxSelect !== 1) {
				def.push(
					'array()',
					typeof field.options.minSelect === 'number' &&
						`min(${field.options.minSelect})`,
					typeof field.options.maxSelect === 'number' &&
						`min(${field.options.maxSelect})`
				);
			}
			break;
		case 'file':
			def.push('instanceof(File)');
			if (field.options.mimeType?.length) {
				def.push(
					`refine((file) => ${JSON.stringify(
						field.options.mimeType
					)}.includes(file.type))`
				);
			}
			if (typeof field.options.maxSize === 'number') {
				def.push(
					`refine((file) => file.size <= ${field.options.maxSize})`
				);
			}

			if (field.options.maxSelect !== 1) {
				def.push(
					'array()',
					typeof field.options.maxSelect === 'number' &&
						`min(${field.options.maxSelect})`
				);
			}
			break;
		case 'json':
			def.push('any()');
			break;
		default:
			break;
	}

	if (!field.required) {
		def.push('optional()');
	}

	return def.filter(Boolean).join('.');
}
