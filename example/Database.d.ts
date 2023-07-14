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
	date?: string | Date;
	content?: string;
	published?: boolean;
	owner?: string;
};

export type PostsUpdate = {
	title?: string;
	slug?: string;
	date?: string | Date;
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

// ===== Schema =====

export type Schema = {
	users: UsersCollection;
	posts: PostsCollection;
};
