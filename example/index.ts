import PocketBase from 'pocketbase';
import { Schema } from './Database.js';
import { TypedPocketBase, fields, expand, eq, asc } from '../src/index.js';

const db = new PocketBase('http://localhost:8090') as TypedPocketBase<Schema>;
await db.admins.authWithPassword('test@test.com', 'secretpassword');

const newPost = await db.collection('posts').create({
	title: 'Blaaa',
	slug: 'blaaa',
	date: new Date(0)
});

const updatedPost = await db.collection('posts').update(newPost.id, {
	date: new Date()
});

console.log({
	newPost,
	updatedPost
});

const posts = await db.collection('posts').getFullList({
	fields: fields('id', 'date'),
	sort: asc('date'),
	filter: eq('published', true)
});

console.log(posts);

// db.collection('posts').update('', {
// 	date
// })

process.exit();

{
	const posts = await db.collection('posts').getFullList({
		fields: fields('id', 'title', 'slug', 'content'),
		sort: asc('date'),
		filter: eq('published', true)
	});

	console.log(posts);
}

{
	const posts = await db.collection('posts').getFullList({
		sort: asc('date'),
		filter: eq('owner.email', 'user@test.com'),
		expand: expand({
			owner: true
		})
	});

	console.log(posts[0].expand.owner);
}

{
	const post = await db
		.collection('posts')
		.getFirstListItem(eq('owner.email', 'user@test.com'), {
			expand: expand({
				owner: true
			})
		});

	console.log(post);
}
