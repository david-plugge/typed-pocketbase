import { z } from 'zod';

const PostsSchema = z.object({
	title: z.string(),
	slug: z
		.string()
		.min(3)
		.regex(/^[a-z0-9]+(?:(?:-|_)+[a-z0-9]+)*$/),
	date: z.coerce.date().optional(),
	content: z.string().optional(),
	published: z.boolean().optional(),
	owner: z.string().optional(),
	metadata: z.any().optional(),
	state: z.enum(['a', 'b', 'c']).optional()
});

function toFormData(obj: Record<string, any>) {
	const data = new FormData();
	let key: keyof typeof obj;
	for (key in obj) {
		data.append(key, obj[key]);
	}
	return data;
}
