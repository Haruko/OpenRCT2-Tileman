// https://github.com/Sadret/openrct2-rctris/blob/main/rollup.config.develop.js

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import { homedir } from 'os';
import npmPackage from './package.json' assert { type: 'json' };

export default {
	input: './src/index.ts',
	output: [{
		format: 'iife',
		file: `./build/openrct2-tileman-${npmPackage.version}-develop.js`,
	}, {
		format: 'iife',
		file: `${homedir()}/Documents/OpenRCT2/plugin/openrct2-tileman-${npmPackage.version}-develop.js`,
	}],
	plugins: [
		resolve(),
		typescript(),
	],
};