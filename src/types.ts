import type { Global } from "@jest/types";

export interface SQLQueryInfo {
  activeTest: string | undefined;
  running: boolean | undefined;
}

export type SQLQueryMap = Record<string, string[]>;

export interface SQLEnvGlobal extends Global.Global {
  sqlQueryInfo?: SQLQueryInfo;
  sqlQueryMap?: SQLQueryMap;
}
