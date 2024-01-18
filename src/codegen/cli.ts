import sade from 'sade';
import { generateTypes } from './index.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

interface CliOptions {
	url?: string;
	email?: string;
	password?: string;
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
		async ({
			url,
			email = process.env.POCKETBASE_EMAIL,
			password = process.env.POCKETBASE_PASSWORD,
			out
		}: CliOptions) => {
			if (!url) error(`required option '-u, --url' not specified`);

			if (!email)
				error(
					`required option '-e, --email' not specified and 'POCKETBASE_EMAIL' env not set`
				);

			if (!password)
				error(
					`required option '-p, --password' not specified and 'POCKETBASE_PASSWORD' env not set`
				);

			const definition = await generateTypes({
				url,
				email,
				password
			});

			if (out) {
				const file = resolve(out);
				await mkdir(dirname(file), { recursive: true });
				await writeFile(file, definition + '\n', 'utf-8');
			} else {
				console.log(definition);
			}
		}
	)
	.parse(process.argv);

function error(msg: string): never {
	console.error(msg);
	process.exit();
}
