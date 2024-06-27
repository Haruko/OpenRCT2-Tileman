// https://github.com/Sadret/openrct2-rctris/blob/main/rollup.config.develop.js
// https://github.com/ltsSmitty/OpenRCT2-Simple-Typescript-Template-Async/blob/main/rollup.config.js

import inject from "@rollup/plugin-inject";
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

import path from 'path';
import { homedir } from 'os';

import npmPackage from './package.json' assert { type: 'json' };

export default {
  input: path.resolve('./src/remote/index.ts'),
  output: [{
    format: 'iife',
    file: `./build/openrct2-tileman-${npmPackage.version}-develop.js`,
  }, {
    format: 'iife',
    file: `${homedir()}/Documents/OpenRCT2/plugin/openrct2-tileman-${npmPackage.version}-develop.js`,
  }],
  plugins: [
    inject({
      Promise: [path.resolve('src/remote/polyfills/promisePolyfill.ts'), 'PromisePolyfill'],
    }),
    resolve(),
    replace({
      preventAssignment: true,
      __environment: JSON.stringify('development'),
      __version: JSON.stringify(npmPackage.version),
    }),
    typescript()
  ],
};