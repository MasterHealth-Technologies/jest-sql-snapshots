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

In your test setup file(s):

```js
import { recordKnexEvents, stopRecordingKnexEvents } from "jest-sql-snapshots";

const knex = setupDb(); // instantiate / get knex somehow from your codebase

beforeAll(() => {
  recordKnexEvents(knex);
});

afterAll(() => {
  stopRecordingKnexEvents(knex);
});
```

Then in your test suite:

```js
describe("something", () => {
  it("run the expected sql", async () => {
    await someQuery();
    expect("sql").toMatchSnapshot();
  });
});
```

Optionally, if you have other queries running in your `it()` block that you're not interested in snapshotting, you can wrap just the target query:

```js
import { recordSql } from "jest-sql-snapshots";

describe("something more involved", () => {
  it("run the expected target sql", async () => {
    await someOtherQuery();

    await recordSql("mytargetquery", () => someQuery());
    expect("sql:mytargetquery").toMatchSnapshot();
  });
});
```

You can use this block wrapper approach multiple times with different names provided as the first argument.
