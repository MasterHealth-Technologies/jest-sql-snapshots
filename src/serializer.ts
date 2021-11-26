import type { Plugin } from "pretty-format";
import { SQLEnvGlobal } from "./types";

const localGlobal = global as unknown as SQLEnvGlobal;

export = {
  serialize() {
    if (
      !localGlobal.sqlQueryInfo ||
      !localGlobal.sqlQueryInfo.activeTest ||
      !localGlobal.sqlQueryMap
    ) {
      return "jest-sql-snapshots improperly configured (no global state)";
    }

    const activeTestRecording =
      localGlobal.sqlQueryMap[localGlobal.sqlQueryInfo.activeTest];

    if (!activeTestRecording) {
      return "No recordings found";
    }

    return activeTestRecording
      .map((sqlStr) => `  ${sqlStr.replace(/[\n\s]+/g, " ")}`)
      .sort()
      .join("\n");
  },

  test(val) {
    return val === "sql";
  },
} as Plugin;
