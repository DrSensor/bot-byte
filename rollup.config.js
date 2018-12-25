import {dirname, resolve, parse} from "path"
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
const mapInput = inputs => {
	const result = {}
	for (const key in inputs) {
		if (!key.includes('*')) Object.assign(result, {[key]: inputs[key]})
		else { // support glob pattern
			const [prefix, suffix] = key.split('*')
			const input = glob(inputs[key]).reduce(
				(obj, item) => (obj[`${prefix}/${parse(item).name}${suffix}`] = item, obj), {}
			)
			Object.assign(result, input)
		}
	}
	return result
}
// #endregion

// Default Configuration
const configure = ({input, output, watch, ...others}) => ({
	input,
	output: Object.assign({
		format: "cjs",
		exports: "default"
	}, output),
	experimentalCodeSplitting: true,
	watch: {clearScreen: false},
	// 👇 I wonder if I can convert it as a plugin like rollup-plugin-auto-external 🤔
	external: id => /byteballcore/.test(id) || /bitcore/.test(id) || /@oclif/.test(id),
	plugins: [
		dev && run({ bin: pkg.bin[pkg.name] }),
		json(),
		alias({
			resolve: [".ts"],
			readline: resolve("./src/shim-readline")
			// 🤔 I'm still uncertain if I need to shim the readline or the stdin/stdout
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
			useTsconfigDeclarationDir: true
		}),
		prettier(prettierrc.files("*.js")),
	],
	...others,
})

// Rollup Configuration
export default [
	configure({
		input: mapInput({
			index: "src/index.ts",
			"commands/*": "src/commands/*.ts"
		}),
		output: {
			dir: dirname(pkg.main),
			chunkFileNames: "chunks/[name]-[hash].js"
		},
	})
]