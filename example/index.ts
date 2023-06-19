import PocketBase from 'pocketbase';
import { CollectionRecords } from './pocketbase-types';
import { TypedPocketBase, neq, sort, fields } from '../src';

const db: TypedPocketBase<CollectionRecords> = new PocketBase('http://localhost:8090');

const { items } = await db.collection('posts').getList(1, 10, {
	fields: fields('content', 'created', 'id'),
	sort: sort('-date'),
	filter: neq('content', '')
});
