import { resolve } from "node:path";
import { configDefaults, defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ["dotenv/config", "./test/setup-env.ts"],
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
        "**/database-generated.types.ts",
        "**/database.types.ts",
      ],
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
});
