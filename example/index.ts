import { Schema } from './Database.js';
import { TypedPocketBase, eq, or } from '../src/index.js';

const db = new TypedPocketBase<Schema>('http://localhost:8090');
await db.admins.authWithPassword('admin@example.com', 'secretpassword');

const res = await db.from('users').authWithPassword('', '', {
	select: {
		id: true,
		expand: {
			'posts(owner)': true
		}
	}
});

{
	const posts = await db.from('posts').getFullList({
		select: {
			id: true,
			title: true,
			slug: true,
			content: true,
			expand: {
				owner: {
					expand: {
						'posts(owner)': true
					}
				}
			}
		},
		sort: '+date',
		filter: eq('published', true)
	});

	console.log(posts[0].expand);
}

{
	const posts = await db.from('posts').getFullList({
		select: {
			expand: {
				owner: true
			}
		},
		sort: '+date',
		filter: eq('owner.email', 'user@test.com')
	});

	console.log(posts[0].expand);
}

{
	const post = await db
		.from('posts')
		.getFirstListItem(eq('owner.email', 'user@test.com'), {
			select: {
				expand: {
					owner: true
				}
			}
		});
	console.log(post);
}

{
	const sort = db.from('posts').createSort('+id');

	const filter = db
		.from('posts')
		.createFilter(or(eq('content', 'bla'), eq('published', true)));

	const select = db.from('posts').createSelect({
		id: true,
		content: true,
		owner: true,
		collectionName: true,
		asd: true,
		expand: {
			owner: {
				username: true,
				email: true
			}
		}
	});

	const posts = await db.from('posts').getFullList({
		filter,
		select,
		sort
	});

	console.log(posts);
}
