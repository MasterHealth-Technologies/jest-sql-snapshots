import type { Plugin } from "pretty-format";
import { SQLEnvGlobal } from "./types";

const localGlobal = global as unknown as SQLEnvGlobal;

export = {
  serialize(val: string) {
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

    let recordingFrames = activeTestRecording.slice();
    const [, name] = val.split(":");
    if (name) {
      const startIndex = recordingFrames.indexOf(`sqlstart:${name}`);
      if (startIndex !== -1) {
        recordingFrames = recordingFrames.slice(startIndex + 1);
      }
      const finishIndex = recordingFrames.indexOf(`sqlfinish:${name}`);
      if (finishIndex !== -1) {
        recordingFrames = recordingFrames.slice(0, finishIndex);
      }
    }

    return recordingFrames
      .map((sqlStr) => `  ${sqlStr.replace(/[\n\s]+/g, " ")}`)
      .sort()
      .join("\n");
  },

  test(val) {
    return typeof val === "string" && val.startsWith("sql");
  },
} as Plugin;
