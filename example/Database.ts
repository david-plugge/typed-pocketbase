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

export type UsersRecord = {
	name?: string;
	avatar?: string;
};

export type UsersResponse = UsersRecord & AuthSystemFields<'users'>;

export type UsersCollection = {
	collectionId: '_pb_users_auth_';
	collectionName: 'users';
	record: UsersRecord;
	response: UsersResponse;
	files: {
		avatar: { thumbs: never };
	};
	relations: {
		'posts(owner)': PostsCollection[];
	};
};

export type PostsRecord = {
	title: string;
	slug: string;
	date?: string;
	content?: string;
	published?: boolean;
	owner?: string;
};

export type PostsResponse = PostsRecord & BaseSystemFields<'posts'>;

export type PostsCollection = {
	collectionId: 'sbrth2mzfnqba9e';
	collectionName: 'posts';
	record: PostsRecord;
	response: PostsResponse;
	files: {};
	relations: {
		owner: UsersCollection;
	};
};

export type Schema = {
	users: UsersCollection;
	posts: PostsCollection;
};
