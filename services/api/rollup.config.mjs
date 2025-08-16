import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import { swc } from "@rollup/plugin-swc";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.ts",
  output: {
    format: "es",
    file: "dist/index.mjs",
    inlineDynamicImports: true,
  },
  plugins: [
    url(),
    json(),
    resolve({
      extensions: [".js", ".mjs", ".json", ".node", ".ts", ".tsx"],
      preferBuiltins: true,
    }),
    commonjs({}),
    swc(),
    typescript({ sourceMap: false }),
  ],
});
