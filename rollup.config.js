import {dirname, resolve} from "path"
import {sync as glob} from "globby"
import pkg from "./package.json"
import prc from "./.prettierrc.json"

import commonjs from "rollup-plugin-commonjs"
import nodeResolve from "rollup-plugin-node-resolve"
import json from "rollup-plugin-json"
import shim from "rollup-plugin-shim"
import alias from "rollup-plugin-alias"
import babel from "rollup-plugin-babel"
import prettier from "rollup-plugin-prettier"
import typescript from "rollup-plugin-typescript2"

// #region helper
let {overrides, ...options} = prc
const prettierrc = {
	options: options,
	files: files => overrides.find(p => p.files === files).options
}
// #endregion

/** TODO:
 * use https://oclif.io/docs/base_class
 * follow up with https://oclif.io/docs/running_programmatically
 * finally use rollup-plugin-multi-entry to be able to use watch mode
 */ 
// Rollup Configuration
export default [{
	input: glob([
		"src/index.ts",
		"src/commands/*.ts"
	]),
	output: {
		dir: dirname(pkg.main),
		format: "cjs",
		exports: "named"
	},
	experimentalCodeSplitting: true,
	// 👇 I wonder if I can convert it as a plugin like auto external 🤔
	external: id => /byteballcore/.test(id) || /bitcore/.test(id) || /@oclif/.test(id),
	// 👆
	plugins: [
		json(),
		typescript({
			exclude: ["test/**"],
			tsconfigOverride: {
				compilerOptions: {
					module: "esnext"
				}
			},
			useTsconfigDeclarationDir: true
		}),
		alias({
			resolve: [".ts"],
			readline: resolve("./src/shim-readline")
			// 🤔 I'm still uncertain if I need to shim the readline or stdin/stdout 
		}),
		shim({
			os: "export const hostname = () => require('byteballcore/conf.js').deviceName"
		}),
		babel(),
		commonjs(),
		nodeResolve(),
		prettier(prettierrc.files("*.js"))
	]
}]