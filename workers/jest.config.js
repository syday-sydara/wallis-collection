import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/integration/**/*.test.ts"],
  globalSetup: "<rootDir>/setup/global-setup.ts",
  globalTeardown: "<rootDir>/setup/global-teardown.ts",
  setupFilesAfterEnv: ["<rootDir>/setup/jest-setup.ts"],
  maxWorkers: 1, // BullMQ requires single-threaded tests
};

export default config;
