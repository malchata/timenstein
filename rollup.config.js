/* eslint-env node */
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const commonTerserOptions = {
  timings: true,
  compress: {
    sequences: true,
    conditionals: true,
    evaluate: true,
    unsafe_arrows: true,
    warnings: true
  }
};

export default [
  {
    input: pkg.module,
    output: {
      file: "dist/timenstein.min.mjs",
      format: "esm"
    },
    plugins: [
      babel({
        presets: [
          [
            "@babel/preset-env", {
              targets: {
                esmodules: true
              },
              loose: true
            }
          ]
        ]
      }),
      terser({
        ecma: 8,
        mangle: {
          keep_fnames: true,
          toplevel: true,
          reserved: ["timenstein"],
          module: true
        },
        ...commonTerserOptions
      })
    ]
  },
  {
    input: pkg.module,
    output: {
      name: "timenstein",
      file: "dist/timenstein.min.js",
      format: "iife"
    },
    plugins: [
      babel({
        presets: [
          [
            "@babel/preset-env", {
              targets: ">0.5%, last 5 versions, ie > 10, not dead",
              loose: true
            }
          ]
        ]
      }),
      terser({
        ecma: 5,
        mangle: {
          keep_fnames: true,
          toplevel: true,
          reserved: ["Timenstein"],
          module: false
        },
        ...commonTerserOptions
      })
    ]
  },
  {
    input: pkg.module,
    output: {
      file: pkg.main,
      format: "cjs"
    }
  }
];
