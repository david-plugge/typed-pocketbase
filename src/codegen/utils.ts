export function parseIndex(index: string) {
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

export function pascalCase(str: string) {
	return str
		.replace(/[-_]([a-z])/g, (m) => m[1].toUpperCase())
		.replace(/^\w/, (s) => s.toUpperCase());
}
