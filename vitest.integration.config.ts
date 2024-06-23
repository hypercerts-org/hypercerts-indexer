import { configDefaults, defineConfig } from "vitest/config";
import { config } from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";

config({ path: resolve(__dirname, ".env") });

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    fileParallelism: false,
    testTimeout: 30000,
    include: ["./integration/**/*.test.ts"],
    globalSetup: ["./integration/globalSetup.ts"],
    setupFiles: ["./integration/setup-env.ts"],
    // https://github.com/davelosert/vitest-coverage-report-action
    coverage: {
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: ["text", "json-summary", "json"],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
      thresholds: {
        lines: 55,
        branches: 55,
        functions: 55,
        statements: 55,
      },
      exclude: [
        ...(configDefaults.coverage.exclude as string[]),
        "**/*.types.ts",
        "**/types.ts",
        "lib/*",
      ],
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
});
