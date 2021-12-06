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
    const bindings = options.withBindings ? data.bindings : [];
    const sqlString = knex.raw(data.sql, bindings).toString();
    queries.push(sqlString);
  };

let eventHandler: (...args: any[]) => void;

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
