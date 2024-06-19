// https://github.com/Sadret/openrct2-rctris/blob/main/rollup.config.release.js
// https://github.com/ltsSmitty/OpenRCT2-Simple-Typescript-Template-Async/blob/main/rollup.config.js

import inject from "@rollup/plugin-inject";
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

import path from 'path';
import { homedir } from 'os';

import npmPackage from './package.json' assert { type: 'json' };

export default {
  input: './src/index.ts',
  output: [{
    format: 'iife',
    file: `./build/openrct2-tileman-${npmPackage.version}.js`,
  }, {
    format: 'iife',
    file: `${homedir()}/Documents/OpenRCT2/plugin/openrct2-tileman-${npmPackage.version}.js`,
  }],
  plugins: [
    inject({
      Promise: [path.resolve('src/polyfills/promisePolyfill.ts'), 'PromisePolyfill'],
    }),
    resolve(),
    replace({
      preventAssignment: true,
      __environment: JSON.stringify('release')
    }),
    typescript(),
    terser({
      format: {
        preamble: '\
// Copyright (c) 2024 Isoitiro\n\
// This software is licensed under the GNU General Public License version 3.\n\
// This software uses OpenRCT2-FlexUI by Basssiiie which is licensed under the MIT License.\n\
// This software uses code from openrct2-rctris by Sadret which is licensed under the GNU GPLv3 License.\n\
// This software uses code from OpenRCT2-Simple-Typescript-Template-Async by ItsSmitty which is licensed under the MIT License.\n\
// The full text of these licenses can be found here: https://github.com/Haruko/OpenRCT2-Tileman\
        ',
      },
    }),
  ],
};