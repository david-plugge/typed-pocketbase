import PocketBase from 'pocketbase';
import { Schema } from './Database.js';
import { TypedPocketBase, eq, asc } from '../src/index.js';
import { createOptions } from '../src/queryParams.js';

const db = new PocketBase('http://localhost:8090') as TypedPocketBase<Schema>;
await db.admins.authWithPassword('admin@example.com', 'secretpassword');

{
	const posts = await db.collection('posts').getFullList(
		createOptions({
			select: {
				id: true,
				title: true,
				slug: true,
				content: true,
				$expand: {
					owner: {
						$expand: {
							'posts(owner)': {
								owner: true
							}
						}
					}
				}
			},
			sort: '+date',
			filter: eq('published', true)
		})
	);

	console.log(posts);
}

{
	const posts = await db.collection('posts').getFullList(
		createOptions({
			select: {
				$expand: {
					owner: true
				}
			},
			sort: asc('date'),
			filter: eq('owner.email', 'user@test.com')
		})
	);

	console.log(posts[0].expand.owner);
}

{
	const post = await db.collection('posts').getFirstListItem(
		eq('owner.email', 'user@test.com'),
		createOptions({
			select: {
				$expand: {
					owner: true
				}
			}
		})
	);
	console.log(post);
}
