/**
 * This file was @generated using typed-pocketbase
 */

// https://pocketbase.io/docs/collections/#base-collection
export interface BaseCollectionResponse {
	/**
	 * 15 characters string to store as record ID.
	 */
	id: string;
	/**
	 * Date string representation for the creation date.
	 */
	created: string;
	/**
	 * Date string representation for the creation date.
	 */
	updated: string;
	/**
	 * The collection id.
	 */
	collectionId: string;
	/**
	 * The collection name.
	 */
	collectionName: string;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface BaseCollectionCreate {
	/**
	 * 15 characters string to store as record ID.
	 * If not set, it will be auto generated.
	 */
	id?: string;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface BaseCollectionUpdate {}

// https://pocketbase.io/docs/collections/#auth-collection
export interface AuthCollectionResponse extends BaseCollectionResponse {
	/**
	 * The username of the auth record.
	 */
	username: string;
	/**
	 * Auth record email address.
	 */
	email: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility: boolean;
	/**
	 * Indicates whether the auth record is verified or not.
	 */
	verified: boolean;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface AuthCollectionCreate extends BaseCollectionCreate {
	/**
	 * The username of the auth record.
	 * If not set, it will be auto generated.
	 */
	username?: string;
	/**
	 * Auth record email address.
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Auth record password.
	 */
	password: string;
	/**
	 * Auth record password confirmation.
	 */
	passwordConfirm: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface AuthCollectionUpdate {
	/**
	 * The username of the auth record.
	 */
	username?: string;
	/**
	 * The auth record email address.
	 * This field can be updated only by admins or auth records with "Manage" access.
	 * Regular accounts can update their email by calling "Request email change".
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Old auth record password.
	 * This field is required only when changing the record password. Admins and auth records with "Manage" access can skip this field.
	 */
	oldPassword?: string;
	/**
	 * New auth record password.
	 */
	password: string;
	/**
	 * New auth record password confirmation.
	 */
	passwordConfirm: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/collections/#view-collection
export interface ViewCollectionRecord {
	id: string;
}

// utilities

type MaybeArray<T> = T | T[];

// ===== users =====

export interface UsersResponse extends AuthCollectionResponse {
	collectionName: 'users';
	name: string;
	avatar: string;
}

export interface UsersCreate extends AuthCollectionCreate {
	name?: string;
	avatar?: File;
}

export interface UsersUpdate extends AuthCollectionUpdate {
	name?: string;
	avatar?: File;
}

export interface UsersCollection {
	type: 'auth';
	collectionId: string;
	collectionName: 'users';
	response: UsersResponse;
	create: UsersCreate;
	update: UsersUpdate;
	relations: {
		'posts(owner)': PostsCollection;
	};
}

// ===== test2 =====

export interface Test2Response extends BaseCollectionResponse {
	collectionName: 'test2';
	test: string;
}

export interface Test2Create extends BaseCollectionCreate {
	test?: string;
}

export interface Test2Update extends BaseCollectionUpdate {
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

// ===== test =====

export interface TestResponse extends BaseCollectionResponse {
	collectionName: 'test';
	test: string;
	editor: string;
	number: number;
	bool: boolean;
	email: string;
	url: string;
	date: string;
	select: '' | 'a' | 'b' | 'c' | 'd';
	file: string;
	relation: string;
	json: any;
}

export interface TestCreate extends BaseCollectionCreate {
	test?: string;
	editor?: string;
	number?: number;
	bool?: boolean;
	email?: string;
	url?: string | URL;
	date?: string | Date;
	select?: '' | 'a' | 'b' | 'c' | 'd';
	file?: File;
	relation?: string;
	json?: any;
}

export interface TestUpdate extends BaseCollectionUpdate {
	test?: string;
	editor?: string;
	number?: number;
	'number+'?: number;
	'number-'?: number;
	bool?: boolean;
	email?: string;
	url?: string | URL;
	date?: string | Date;
	select?: '' | 'a' | 'b' | 'c' | 'd';
	file?: File;
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

// ===== posts =====

export interface PostsResponse extends BaseCollectionResponse {
	collectionName: 'posts';
	title: string;
	content: string;
	published: boolean;
	owner: string;
	slug: string;
	date: string;
}

export interface PostsCreate extends BaseCollectionCreate {
	title: string;
	content?: string;
	published?: boolean;
	owner?: string;
	slug: string;
	date?: string | Date;
}

export interface PostsUpdate extends BaseCollectionUpdate {
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

// ===== Schema =====

export type Schema = {
	users: UsersCollection;
	test2: Test2Collection;
	test: TestCollection;
	posts: PostsCollection;
};
