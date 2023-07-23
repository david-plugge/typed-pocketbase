export type CollectionType = 'auth' | 'view' | 'base';

interface GenericCollection {
	id: string;
	created: string;
	updated: string;
	name: string;
	type: CollectionType;
	system: boolean;
	schema: Field[];
	indexes: string[];
	listRule: string | null;
	viewRule: string | null;
	createRule: string | null;
	updateRule: string | null;
	deleteRule: string | null;
	options: {};
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

interface GenericField {
	id: string;
	name: string;
	type: FieldType;
	system: boolean;
	required: boolean;
	options: {};
}

export interface TextField extends GenericField {
	type: 'text';
	options: {
		min: number | null;
		max: number | null;
		pattern: string | null;
	};
}

export interface EditorField extends GenericField {
	type: 'editor';
}

export interface NumberField extends GenericField {
	type: 'number';
	options: {
		min: number | null;
		max: number | null;
	};
}

export interface BoolField extends GenericField {
	type: 'bool';
}

export interface EmailField extends GenericField {
	type: 'email';
	options: {
		exceptDomains: [] | null;
		onlyDomains: [] | null;
	};
}

export interface UrlField extends GenericField {
	type: 'url';
	options: {
		exceptDomains: [];
		onlyDomains: [];
	};
}

export interface DateField extends GenericField {
	type: 'date';
	options: {
		min: string;
		max: string;
	};
}

export interface SelectField extends GenericField {
	type: 'select';
	options: {
		maxSelect: number;
		values: string[];
	};
}

export interface RelationField extends GenericField {
	type: 'relation';
	options: {
		collectionId: string;
		cascadeDelete: boolean;
		minSelect: number | null;
		maxSelect: number;
		displayFields: string[];
	};
}

export interface FileField extends GenericField {
	type: 'file';
	options: {
		maxSelect: number;
		maxSize: number;
		mimeType: string[];
		thumbs: string[];
		protected: boolean;
	};
}

export interface JsonField extends GenericField {
	type: 'json';
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
