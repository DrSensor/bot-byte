import {dirname, resolve} from "path"
import {sync as glob} from "globby"
import pkg from "./package.json"
import prc from "./.prettierrc.json"

import commonjs from "rollup-plugin-commonjs"
import nodeResolve from "rollup-plugin-node-resolve"
import json from "rollup-plugin-json"
import shim from "rollup-plugin-shim"
import alias from "rollup-plugin-alias"
import run from "rollup-plugin-run"
import babel from "rollup-plugin-babel"
import prettier from "rollup-plugin-prettier"
import typescript from "rollup-plugin-typescript2"

// #region helper
let {overrides, ...options} = prc
const prettierrc = {
	options: options,
	files: files => overrides.find(p => p.files === files).options
}
const dev = process.env.ROLLUP_WATCH === 'true'
// #endregion

// Default Configuration
const configure = ({input, output, watch, ...others}) => ({
	input,
	output: Object.assign({
		format: "cjs",
		// why oclif, why!! 😂 https://github.com/oclif/config/commit/5854d34
		chunkFileNames: "[name]-[hash].spec.js",
		exports: "named"
	}, output),
	experimentalCodeSplitting: true,
	watch: {
		clearScreen: false
	},
	// 👇 I wonder if I can convert it as a plugin like rollup-plugin-auto-external 🤔
	external: id => /byteballcore/.test(id) || /bitcore/.test(id) || /@oclif/.test(id),
	plugins: [
		dev && run({ bin: pkg.bin[pkg.name] }),
		json(),
		alias({
			resolve: [".ts"],
			readline: resolve("./src/shim-readline")
			// 🤔 I'm still uncertain if I need to shim the readline or stdin/stdout 
		}),
		shim({
			os: "export const hostname = () => require('byteballcore/conf.js').deviceName"
		}),
		babel(),
		nodeResolve(),
		commonjs({ignore: id => id !== "readline"}),
		typescript({
			exclude: ["test/**"],
			tsconfigOverride: {
				compilerOptions: {
					module: "esnext"
				}
			},
			// rollupCommonJSResolveHack: true, // seems he has fix it 🎉
			useTsconfigDeclarationDir: true
		}),
		prettier(prettierrc.files("*.js")),
	],
	...others,
})

// Rollup Configuration
export default [
	configure({
		input: glob("src/commands/*.ts"),
		output: {dir: dirname(pkg.main) + "/commands"},
	}),
	configure({
		input: "src/index.ts",
		output: {file: pkg.main},
	})
]