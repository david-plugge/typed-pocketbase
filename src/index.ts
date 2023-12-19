import PocketBase, { RecordModel, RecordService } from 'pocketbase';
import { GenericSchema } from './types.js';
import { TypedRecordService } from './record-service.js';

export {
	createOptions,
	ResolveSelect,
	ResolveSelectWithExpand,
	Select,
	SelectWithExpand,
	TypedBaseQueryParams,
	TypedFullListQueryParams,
	TypedListQueryParams,
	TypedRecordFullListQueryParams,
	TypedRecordListQueryParams,
	TypedRecordQueryParams
} from './queryParams.js';

export {
	and,
	or,
	eq,
	gt,
	gte,
	like,
	lt,
	lte,
	neq,
	nlike,
	Filter
} from './filter.js';
export { asc, desc, sort, Sort } from './sort.js';
export { GenericSchema, GenericCollection, TypedRecord } from './types.js';

export interface TypedPocketBase<Schema extends GenericSchema>
	extends PocketBase {
	collection<C extends keyof Schema>(
		idOrName: C
	): TypedRecordService<Schema[C]>;
	collection<M = RecordModel>(idOrName: string): RecordService<M>;
}
