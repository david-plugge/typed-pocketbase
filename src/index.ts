import PocketBase from 'pocketbase';
import { GenericSchema } from './types.js';
import { TypedRecordService } from './record-service.js';
import { TypedFileService } from './file-service.js';

export { fields } from './fields.js';
export { and, or, eq, gt, gte, like, lt, lte, neq, nlike } from './filter.js';
export { expand } from './expand.js';
export { asc, desc, sort } from './sort.js';
export { GenericSchema, GenericCollection, TypedRecord } from './types.js';

// @ts-expect-error typescript...
export interface TypedPocketBase<Schema extends GenericSchema>
	extends PocketBase {
	collection<C extends keyof Schema>(
		idOrName: C
	): TypedRecordService<Schema[C]>;

	files: TypedFileService<Schema>;
}
