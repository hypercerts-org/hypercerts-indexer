// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "es",
    sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    nodeResolve(),
    typescript(),
    sentryRollupPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "hypercerts",
      project: "hypercerts-indexer",
    }),
  ],
};

export default config;
