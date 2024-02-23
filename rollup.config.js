// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [nodeResolve(), typescript()],
};

export default config;
