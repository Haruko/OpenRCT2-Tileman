// https://github.com/Sadret/openrct2-rctris/blob/main/rollup.config.develop.js

import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
	input: "./src/index.ts",
	output: [{
		format: "iife",
		file: "./build/openrct2-tileman-develop.js",
	}, {
		format: "iife",
		file: "C:/Users/zoeyb/Documents/OpenRCT2/plugin/openrct2-tileman-develop.js",
	}],
	plugins: [
		resolve(),
		typescript(),
	],
};