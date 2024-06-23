import { configDefaults, defineConfig } from "vitest/config";
import { config } from "dotenv";
import { resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

config({ path: resolve(__dirname, ".env") });

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ["./test/setup-env.ts"],
    exclude: [
      ...(configDefaults.exclude as string[]),
      "**/integration/**/*ts",
      "lib",
    ],
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
      include: ["test/**/*.test.ts", "!integration/**/*.test.ts"],
      exclude: [
        ...(configDefaults.coverage.exclude as string[]),
        "**/*.types.ts",
        "**/types.ts",
        "all_leaf_claimed_events.ts",
        "lib/*",
      ],
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
});
