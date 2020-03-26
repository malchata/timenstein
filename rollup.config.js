/* eslint-env node */
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const commonConfigOptions = {
  input: "src/timenstein.mjs"
};

export default [
  // ESM build
  {
    output: {
      file: pkg.module,
      format: "esm"
    },
    ...commonConfigOptions
  },
  // CommonJS build
  {
    output: {
      file: pkg.main,
      format: "cjs"
    },
    ...commonConfigOptions
  },
  // Uglified ES6 build
  {
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
        ecma: 2017,
        mangle: {
          reserved: ["Timenstein"],
          module: true
        }
      })
    ],
    ...commonConfigOptions
  },
  // Uglified ES5 build
  {
    output: {
      name: "Timenstein",
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
          reserved: ["Timenstein"],
          module: false
        }
      })
    ],
    ...commonConfigOptions
  }
];
