# jest-sql-snapshots

Record & snapshot your SQL statements during end-to-end tests. Useful in particular for backends that have abstractions (like complex GraphQL resolvers) between the exposed endpoint or API and the underlying query lib like Knex.

You can use these snapshots to track your SQL statement changes as your codebase evolves.

This currently only works for recording with `Knex`.

## Setup

### Installation

```
yarn add -D jest-sql-snapshots
```

or

```
npm i -D jest-sql-snapshots
```

### Jest Configuration

In your `jest.config.js` or `package.json#jest` block:

```js
{
  testEnvironment: 'jest-sql-snapshots/environment',
  snapshotSerializers: ['jest-sql-snapshots/serializer'],
}
```
