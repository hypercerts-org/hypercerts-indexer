// rollup.config.js
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import autoExternal from "rollup-plugin-auto-external";
import esbuild from "rollup-plugin-esbuild";
import nodePolyfills from "rollup-plugin-polyfill-node";
import alias from "@rollup/plugin-alias";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

const config = {
  external: "@sentry/profiling-node",
  input: "src/server.ts",
  output: {
    file: "dist/server.js",
    format: "es",
    sourcemap: true, // Source map generation must be turned on
    inlineDynamicImports: true,
  },
  plugins: [
    autoExternal(),
    nodePolyfills(),
    json(),
    commonjs({
      defaultIsModuleExports: true,
    }),
    alias({
      customResolver: nodeResolve({ extensions: [".tsx", ".ts"] }),
      entries: Object.entries({
        "@/*": ["./src/*"],
      }).map(([alias, value]) => ({
        find: new RegExp(`${alias.replace("/*", "")}`),
        replacement: path.resolve(
          process.cwd(),
          `${value[0].replace("/*", "")}`
        ),
      })),
    }),
    esbuild(),
    sentryRollupPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "hypercerts",
      project: "hypercerts-indexer",
    }),
  ],
};

export default config;

// @/storage/getLastBlockIndexed (imported by "src/indexer/indexClaimsStored.ts")
// @/storage/updateLastBlock (imported by "src/indexer/indexClaimsStored.ts")
// @/monitoring (imported by "src/indexer/indexClaimsStored.ts")
// @/parsing (imported by "src/indexer/indexClaimsStored.ts")
// @/storage (imported by "src/indexer/indexClaimsStored.ts")

// @/storage (imported by "src/indexer/indexClaimsStored.ts")
// @/monitoring (imported by "src/indexer/indexClaimsStored.ts")
// @/parsing (imported by "src/indexer/indexClaimsStored.ts")
