import { SchemaField, CollectionModel } from 'pocketbase';

export type CollectionType = 'auth' | 'view' | 'base';

interface GenericCollection extends CollectionModel {
	schema: Field[];
}

export interface BaseCollection extends GenericCollection {
	type: 'base';
	options: {};
}

export interface ViewCollection extends GenericCollection {
	type: 'view';
	options: {
		query: string;
	};
}

export interface AuthCollection extends GenericCollection {
	type: 'auth';
	options: {
		allowEmailAuth: boolean;
		allowOAuth2Auth: boolean;
		allowUsernameAuth: boolean;
		exceptEmailDomains: string[] | null;
		onlyEmailDomains: string[] | null;
		manageRule: string | null;
		minPasswordLength: number;
		requireEmail: boolean;
	};
}

export type Collection = BaseCollection | ViewCollection | AuthCollection;

export type FieldType =
	| 'text'
	| 'editor'
	| 'number'
	| 'bool'
	| 'email'
	| 'url'
	| 'date'
	| 'select'
	| 'relation'
	| 'file'
	| 'json';

export interface TextField extends SchemaField {
	type: 'text';
	options: {
		min: number | null;
		max: number | null;
		pattern: string | null;
	};
}

export interface EditorField extends SchemaField {
	type: 'editor';
	options: {
		exceptDomains: [];
		onlyDomains: [];
	};
}

export interface NumberField extends SchemaField {
	type: 'number';
	options: {
		min: number | null;
		max: number | null;
	};
}

export interface BoolField extends SchemaField {
	type: 'bool';
	options: {};
}

export interface EmailField extends SchemaField {
	type: 'email';
	options: {
		exceptDomains: [] | null;
		onlyDomains: [] | null;
	};
}

export interface UrlField extends SchemaField {
	type: 'url';
	options: {
		exceptDomains: [];
		onlyDomains: [];
	};
}

export interface DateField extends SchemaField {
	type: 'date';
	options: {
		min: string;
		max: string;
	};
}

export interface SelectField extends SchemaField {
	type: 'select';
	options: {
		maxSelect: number;
		values: string[];
	};
}

export interface RelationField extends SchemaField {
	type: 'relation';
	options: {
		collectionId: string;
		cascadeDelete: boolean;
		minSelect: number | null;
		maxSelect: number;
		displayFields: string[] | null;
	};
}

export interface FileField extends SchemaField {
	type: 'file';
	options: {
		maxSelect: number;
		maxSize: number;
		mimeTypes: string[];
		thumbs: string[] | null;
		protected: boolean;
	};
}

export interface JsonField extends SchemaField {
	type: 'json';
	options: {
		maxSize: number;
	};
}

export type Field =
	| TextField
	| EditorField
	| NumberField
	| BoolField
	| EmailField
	| UrlField
	| DateField
	| SelectField
	| RelationField
	| FileField
	| JsonField;
