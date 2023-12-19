/**
 * This file was @generated using typed-pocketbase
 */

// https://pocketbase.io/docs/collections/#base-collection
interface BaseCollectionRecord {
	id: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;
}

// https://pocketbase.io/docs/collections/#auth-collection
interface AuthCollectionRecord extends BaseCollectionRecord {
	username: string;
	email: string;
	emailVisibility: boolean;
	verified: boolean;
}

// https://pocketbase.io/docs/collections/#view-collection
interface ViewCollectionRecord {
	id: string;
}

// utilities

type MaybeArray<T> = T | T[];

// ===== users =====

export interface UsersResponse extends AuthCollectionRecord {
	collectionName: 'users';
	name?: string;
	avatar?: string;
}

export interface UsersCreate {
	name?: string;
	avatar?: string;
}

export interface UsersUpdate {
	name?: string;
	avatar?: string;
}

export interface UsersCollection {
	type: 'auth';
	collectionId: string;
	collectionName: 'users';
	response: UsersResponse;
	create: UsersCreate;
	update: UsersUpdate;
	relations: {
		'posts(owner)': PostsCollection[];
	};
}

// ===== posts =====

export interface PostsResponse extends BaseCollectionRecord {
	collectionName: 'posts';
	title: string;
	content?: string;
	published?: boolean;
	owner?: string;
	slug: string;
	date?: string;
}

export interface PostsCreate {
	title: string;
	content?: string;
	published?: boolean;
	owner?: string;
	slug: string;
	date?: string | Date;
}

export interface PostsUpdate {
	title?: string;
	content?: string;
	published?: boolean;
	owner?: string;
	slug?: string;
	date?: string | Date;
}

export interface PostsCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'posts';
	response: PostsResponse;
	create: PostsCreate;
	update: PostsUpdate;
	relations: {
		owner: UsersCollection;
	};
}

// ===== test =====

export interface TestResponse extends BaseCollectionRecord {
	collectionName: 'test';
	test?: string;
	editor?: string;
	number?: number;
	bool?: boolean;
	email?: string;
	url?: string;
	date?: string;
	select?: 'a' | 'b' | 'c' | 'd';
	file?: string;
	relation?: string;
	json?: any;
}

export interface TestCreate {
	test?: string;
	editor?: string;
	number?: number;
	bool?: boolean;
	email?: string;
	url?: string | URL;
	date?: string | Date;
	select?: 'a' | 'b' | 'c' | 'd';
	file?: string;
	relation?: string;
	json?: any;
}

export interface TestUpdate {
	test?: string;
	editor?: string;
	number?: number;
	'number+'?: number;
	'number-'?: number;
	bool?: boolean;
	email?: string;
	url?: string | URL;
	date?: string | Date;
	select?: 'a' | 'b' | 'c' | 'd';
	file?: string;
	relation?: string;
	json?: any;
}

export interface TestCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'test';
	response: TestResponse;
	create: TestCreate;
	update: TestUpdate;
	relations: {
		relation: Test2Collection;
	};
}

// ===== test2 =====

export interface Test2Response extends BaseCollectionRecord {
	collectionName: 'test2';
	test?: string;
}

export interface Test2Create {
	test?: string;
}

export interface Test2Update {
	test?: string;
}

export interface Test2Collection {
	type: 'base';
	collectionId: string;
	collectionName: 'test2';
	response: Test2Response;
	create: Test2Create;
	update: Test2Update;
	relations: {
		'test(relation)': TestCollection;
	};
}

// ===== Schema =====

export type Schema = {
	users: UsersCollection;
	posts: PostsCollection;
	test: TestCollection;
	test2: Test2Collection;
};
