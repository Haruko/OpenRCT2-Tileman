// https://github.com/Sadret/openrct2-rctris/blob/main/rollup.config.release.js

import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
	input: "./src/index.ts",
	output: [{
		format: "iife",
		file: "./build/openrct2-tileman-0.0.1.js",
	}, {
		format: "iife",
		file: "C:/Users/zoeyb/Documents/OpenRCT2/plugin/openrct2-tileman-0.0.1.js",
	}],
	plugins: [
		resolve(),
		typescript(),
		terser({
			format: {
				preamble: "\
// Copyright (c) 2024 Isoitiro\n\
// This software is licensed under the GNU General Public License version 3.\n\
// This software uses OpenRCT2-FlexUI by Basssiiie which is licensed under the MIT License.\n\
// This software uses code from openrct2-rctris by Sadret which is licensed under the GNU GPLv3 License.\n\
// The full text of these licenses can be found here: https://github.com/Haruko/OpenRCT2-Tileman\
				",
			},
		}),
	],
};