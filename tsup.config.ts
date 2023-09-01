import { defineConfig } from 'tsup';
import { name, version } from './package.json';

export default defineConfig([
	{
		entry: ['src/index.ts'],
		format: ['esm', 'cjs'],
		outDir: 'dist/client',
		dts: true,
		sourcemap: true,
		clean: true
	},
	{
		entry: ['src/codegen/cli.ts'],
		format: ['esm'],
		outDir: 'dist/codegen',
		dts: false,
		sourcemap: false,
		clean: true,
		banner: {
			js: '#!/usr/bin/env node'
		},
		define: {
			PKG_NAME: JSON.stringify(name),
			PKG_VERSION: JSON.stringify(version)
		}
	}
]);
