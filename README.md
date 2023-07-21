# typed-pocketbase

[![npm](https://img.shields.io/npm/v/typed-pocketbase)](https://www.npmjs.com/package/typed-pocketbase)
![GitHub top language](https://img.shields.io/github/languages/top/david-plugge/typed-pocketbase)
![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/david-plugge/typed-pocketbase/main.yaml?branch=main)

Add types to the [PocketBase JavaScript SDK](https://github.com/pocketbase/js-sdk).

## Installation

```bash
# npm
npm i typed-pocketbase

# pnpm
pnpm i typed-pocketbase

# yarn
yarn add typed-pocketbase
```

## Usage

Generate the types:

```bash
npx typed-pocketbase --email admin@mail.com --password supersecretpassword -o Database.d.ts
```

The codegen tool will look for `POCKETBASE_EMAIL` and `POCKETBASE_PASSWORD` environment variables if the email or password are not passed using cli options.

Create a PocketBase client:

```ts
import PocketBase from 'pocketbase';
import { TypedPocketBase } from 'typed-pocketbase';
import { Schema } from './Database';

const db = new PocketBase('http://localhost:8090') as TypedPocketBase<Schema>;
```

Enjoy full type-safety:

```ts
import { neq, sort, fields } from 'typed-pocketbase';

db.collection('posts').getList(1, 10, {
	fields: fields('id', 'title', 'content'),
	sort: sort('-date'),
	filter: neq('content', '')
});
```

Supported methods

-   getFullList
-   getList
-   getFirstListItem
-   getOne
-   create
-   update
-   subscribe

## Selecting fields

Use the `fields` function to select the properties:

**Note:** Don´t use `expand` when selecting fields

```ts
import { fields } from 'typed-pocketbase';

db.collection('posts').getFullList({
	fields: fields('id', 'title', 'content')
});

// conditionally select fields
// falsy values are excluded
db.collection('posts').getFullList({
	fields: fields(shouldIncludeId && 'id', 'title', 'content')
});
```

## Filtering columns

Use the `and`, `or` and other utility functions to filter rows:

```ts
import { and, or, eq } from 'typed-pocketbase';

// get all posts created in 2022
db.collection('posts').getFullList({
	// a "manual" filter is a tuple of length 3
	filter: and(['date', '<', '2023-01-01'], ['data', '>=', '2022-01-01'])
});

// get all posts expect for those created in 2022
db.collection('posts').getFullList({
	filter: or(['date', '>=', '2023-01-01'], ['data', '<', '2022-01-01'])
});

// get all posts that were create at '2023-01-01'
db.collection('posts').getFullList({
	filter: eq('date', '2023-01-01')
});

// combine or/and with helpers and manual filters
db.collection('posts').getFullList({
	filter: or(
		//
		['date', '>=', '2023-01-01'],
		lt('date', '2022-01-01')
	)
});

// conditionally filter rows
// falsy values are excluded
db.collection('posts').getFullList({
	filter: and(
		//
		gte('date', '2022-01-01'),
		!untilNow && lt('date', '2023-01-01')
	)
});

// filter for columns in relations
// works up to 6 levels deep, including the top level
db.collection('posts').getFullList({
	filter: eq('owner.name', 'me')
});
```

Most filter operators are available as short hand function.

Visit the [pocketbase documentation](https://pocketbase.io/docs/api-records/) to find out about all filters in the `List/Search records` section.

## Sorting rows

Use `sort`, `asc` and `desc` to sort the rows:

```ts
import { sort, asc, desc } from 'typed-pocketbase';

db.collection('posts').getFullList({
	// sort by descending 'date'
	sort: desc('date')
});

db.collection('posts').getFullList({
	// sort by descending 'date' and ascending 'title'
	sort: sort('-date', '+title')
});

db.collection('posts').getFullList({
	// sort by descending 'date' and ascending 'title'
	sort: sort(desc('date'), asc('title'))
});

// you can mix functions with +/- prefixes
db.collection('posts').getFullList({
	// sort by descending 'date' and ascending 'title'
	sort: sort(desc('date'), '+title')
});

// conditionally sort rows
// falsy values are excluded
db.collection('posts').getFullList({
	sort: sort(
		//
		desc('date'),
		sortTitle && asc('title')
	)
});
```

## Expanding

Use the `expand` function to expand relations:

**Note:** Don´t use `fields` when expanding as fields only works for the top level and `expand` would end up as an empty object

```ts
import { expand } from 'typed-pocketbase';

db.collection('posts').getFullList({
	expand: expand({
		user: true
	})
});

// nested expand
db.collection('posts').getFullList({
	expand: expand({
		user: {
			profile: true
		}
	})
});
```

## License

[MIT](https://github.com/david-plugge/typed-pocketbase/blob/main/LICENSE)
