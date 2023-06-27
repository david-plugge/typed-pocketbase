/**
 * This file was @generated using typed-pocketbase
 */

// https://pocketbase.io/docs/collections/#base-collection
type BaseCollectionRecord = {
	id: string;
	created: string;
	updated: string;
};

// https://pocketbase.io/docs/collections/#auth-collection
type AuthCollectionRecord = {
	id: string;
	created: string;
	updated: string;
	username: string;
	email: string;
	emailVisibility: boolean;
	verified: boolean;
};

// https://pocketbase.io/docs/collections/#view-collection
type ViewCollectionRecord = {
	id: string;
};

// utilities

type MaybeArray<T> = T | T[];

// ===== users =====

export type UsersResponse = {
    name?: string;
	avatar?: string;
} & AuthCollectionRecord;

export type UsersCreate = {
	name?: string;
	avatar?: string;
};

export type UsersUpdate = {
	name?: string;
	avatar?: string;
};

export type UsersCollection = {
	type: 'auth';
	collectionId: '_pb_users_auth_';
	collectionName: 'users';
	response: UsersResponse;
	create: UsersCreate;
	update: UsersUpdate;
	relations: {
		'posts(owner)': PostsCollection[];
	};
};

// ===== posts =====

export type PostsResponse = {
    title: string;
	slug: string;
	date?: string;
	content?: string;
	published?: boolean;
	owner?: string;
} & BaseCollectionRecord;

export type PostsCreate = {
	title: string;
	slug: string;
	date?: string;
	content?: string;
	published?: boolean;
	owner?: string;
};

export type PostsUpdate = {
	title?: string;
	slug?: string;
	date?: string;
	content?: string;
	published?: boolean;
	owner?: string;
};

export type PostsCollection = {
	type: 'base';
	collectionId: 'sbrth2mzfnqba9e';
	collectionName: 'posts';
	response: PostsResponse;
	create: PostsCreate;
	update: PostsUpdate;
	relations: {
		owner: UsersCollection;
	};
};

// ===== usis =====

export type UsisResponse = {
    avatar?: string;
} & ViewCollectionRecord;

export type UsisCollection = {
	type: 'view';
	collectionId: 'bubx07xyejsas8a';
	collectionName: 'usis';
	response: UsisResponse;
	relations: {};
};

// ===== test =====

export type TestResponse = {
    options?: ('a' | 'b' | 'c' | 'd')[];
} & BaseCollectionRecord;

export type TestCreate = {
	options?: MaybeArray<'a' | 'b' | 'c' | 'd'>;
};

export type TestUpdate = {
	options?: MaybeArray<'a' | 'b' | 'c' | 'd'>;
	'options+'?: MaybeArray<'a' | 'b' | 'c' | 'd'>;
	'options-'?: MaybeArray<'a' | 'b' | 'c' | 'd'>;
};

export type TestCollection = {
	type: 'base';
	collectionId: '800ro086vmm2fbj';
	collectionName: 'test';
	response: TestResponse;
	create: TestCreate;
	update: TestUpdate;
	relations: {};
};

// ===== Schema =====

export type Schema = {
	users: UsersCollection;
	posts: PostsCollection;
	usis: UsisCollection;
	test: TestCollection;
};
