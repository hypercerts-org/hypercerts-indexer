// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

import dotenv from "dotenv";
dotenv.config();

const config = {
  external: "@sentry/profiling-node",
  input: "src/server.ts",
  output: {
    dir: "dist",
    format: "es",
    sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript(),
    commonjs({ defaultIsModuleExports: true }),
    json(),
    sentryRollupPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "hypercerts",
      project: "hypercerts-indexer",
    }),
  ],
};

export default config;
