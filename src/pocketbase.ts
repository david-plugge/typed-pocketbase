import type PocketBase from 'pocketbase';
import { BaseCollectionRecords, SystemFields } from './types';
import { TypedRecordService } from './record-service';

// @ts-expect-error
export interface TypedPocketBase<Collections extends BaseCollectionRecords = BaseCollectionRecords>
	extends PocketBase {
	collection<C extends keyof Collections | (string & {})>(
		name: C
	): TypedRecordService<Collections[C] & SystemFields>;
}
