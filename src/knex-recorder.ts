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

const localGlobal: LocalGlobal = global as any;

const knexQueryEventHandler = (knex: Knex) => (data: KnexQueryEvent) => {
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
  const sqlString = knex.raw(data.sql, data.bindings).toString();
  queries.push(sqlString);
};

let eventHandler: (...args: any[]) => void;

/**
 * recordKnexEvents takes a knex instance to handle 'query' events
 *
 * recordKnexEvents(knex);
 */
export const recordKnexEvents = (knex: Knex) => {
  eventHandler = knexQueryEventHandler(knex);
  knex.on("query", eventHandler);
};

export const stopRecordingKnexEvents = (knex: Knex) =>
  knex.off("query", eventHandler);
