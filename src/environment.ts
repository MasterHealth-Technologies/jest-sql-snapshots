import NodeEnvironment from "jest-environment-node";
import type { EnvironmentContext } from "@jest/environment";
import type { Circus, Config } from "@jest/types";
import { SQLEnvGlobal } from "./types";

const getTestKey = (event: StartEvent) => {
  let testKey = event.test.name;
  let currentParent: Circus.DescribeBlock | undefined = event.test.parent;
  while (currentParent) {
    if (currentParent.name === "ROOT_DESCRIBE_BLOCK") break;
    testKey = `${currentParent.name} ${testKey}`;
    currentParent = currentParent.parent;
  }
  return testKey;
};

type JestEvent = Circus.AsyncEvent | Circus.SyncEvent;
type StartEvent = {
  name: "test_start";
  test: Circus.TestEntry;
};

/**
 * custom jest environment to allow us to track SQL queries
 * made during our tests for snapshot purposes
 */
class SQLSnapshotEnvironment extends NodeEnvironment {
  private testPath: string;
  public declare global: SQLEnvGlobal;

  constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
    super(config);
    this.testPath = context.testPath;
  }

  async setup() {
    await super.setup();
    this.global.sqlQueryMap = {};
    this.global.sqlQueryInfo = {
      activeTest: undefined,
      running: undefined,
    };
  }

  async teardown() {
    await super.teardown();
  }

  async handleTestEvent(event: JestEvent) {
    if (event.name === "test_start") {
      const testKey = getTestKey(event);
      this.global.sqlQueryInfo!.activeTest = testKey;
      this.global.sqlQueryMap![testKey] = [];
    }

    if (event.name === "test_fn_start") {
      this.global.sqlQueryInfo!.running = true;
    }

    if (["test_fn_success", "test_fn_failure"].includes(event.name)) {
      this.global.sqlQueryInfo!.running = false;
    }

    if (event.name === "test_done") {
      delete this.global.sqlQueryInfo!.activeTest;
    }
  }
}

export = SQLSnapshotEnvironment;
