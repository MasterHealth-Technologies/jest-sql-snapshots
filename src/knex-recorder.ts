import events from "events";
import { SQLQueryInfo, SQLQueryMap } from "./types";

interface KnexQueryEvent {
  sql: string;
  bindings: any[];
}

export interface Knex extends events.EventEmitter {
  raw: (sql: string, bindings: any[]) => object;
}

interface LocalGlobal {
  sqlQueryMap: SQLQueryMap;
  sqlQueryInfo: SQLQueryInfo;
}

interface RecordOptions {
  withBindings?: boolean;
}

const localGlobal: LocalGlobal = global as any;

const knexQueryEventHandler =
  (knex: Knex, options: RecordOptions) => (data: KnexQueryEvent) => {
    const active = localGlobal.sqlQueryInfo.activeTest;
    if (!active) {
      console.warn(
        `[jest-sql-snapshots] Skipping recording query because there's no active test running. Have you configured the jest environment correctly?`
      );
      return;
    }
    const queries = localGlobal.sqlQueryMap[active];
    if (!queries || !localGlobal.sqlQueryInfo.running) {
      return;
    }

    const sqlString = options.withBindings
      ? knex.raw(data.sql, data.bindings).toString()
      : data.sql;
    queries.push(sqlString);
  };

let eventHandler: (...args: any[]) => void;

const markSQL = (name: string) => (mark: string) => {
  const active = localGlobal.sqlQueryInfo.activeTest;
  if (!active) {
    console.warn(
      `[jest-sql-snapshots] Skipping recording query because there's no active test running. Have you configured the jest environment correctly?`
    );
    return;
  }
  const queries = localGlobal.sqlQueryMap[active];
  if (!queries || !localGlobal.sqlQueryInfo.running) {
    return;
  }
  queries.push(`sql${mark}:${name}`);
};

/**
 * recordSql allows for wrapping a block of awaitable code that includes SQL queries
 * for recording and will limit the scope of any snapshot referencing the name provided
 * to just what ran in the provided block
 *
 * to reference the block in a snapshot call, use: `expect('sql:name').toMatchSnapshot()`
 *
 * @param name your name for this block of querying
 * @param block a function that returns a promise within which some SQL is executed through knex
 * @returns whatever your block of code returns
 */
export const recordSql = async <T>(name: string, block: () => Promise<T>) => {
  const mark = markSQL(name);
  mark("start");
  const result = await block();
  mark("finish");
  return result;
};

/**
 * recordKnexEvents takes a knex instance to handle 'query' events
 *
 * recordKnexEvents(knex);
 */
export const recordKnexEvents = (knex: Knex, options: RecordOptions = {}) => {
  eventHandler = knexQueryEventHandler(knex, options);
  knex.on("query", eventHandler);
};

export const stopRecordingKnexEvents = (knex: Knex) =>
  knex.off("query", eventHandler);
