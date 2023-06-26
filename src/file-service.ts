import Client, { BaseQueryParams, Record as PBRecord } from 'pocketbase';
import { GenericSchema } from './types.js';

export interface TypedFileService<Schema extends GenericSchema> {
	readonly client: Client;

	/**
	 * Builds and returns an absolute record file url for the provided filename.
	 */
	getUrl<
		Collection extends keyof Schema,
		Field extends keyof Schema[Collection]['files']
	>(
		record: {
			id: string;
			collectionName: Collection;
			field: Field;
		},
		filename: string,
		queryParams?: TypedFileQueryParams<
			Schema[Collection]['files'][Field]['thumbs']
		>
	): string;
	getUrl(
		record: Pick<PBRecord, 'id' | 'collectionId' | 'collectionName'>,
		filename: string,
		queryParams?: TypedFileQueryParams
	): string;

	/**
	 * Requests a new private file access token for the current auth model (admin or record).
	 */
	getToken(queryParams?: BaseQueryParams): Promise<string>;
}

export interface TypedFileQueryParams<Thumb extends string = string>
	extends BaseQueryParams {
	thumb?: Thumb;
}
