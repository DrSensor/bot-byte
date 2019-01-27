/** TODO: bundler tricks
 * 🔇 shim the console.log on both `bytebeallcore` and `headless-wallet`
 */
import {dirname, resolve, parse} from "path"
import {sync as glob} from "globby"
import {logger} from "@rollup/log"

import commonjs from "rollup-plugin-commonjs"
import nodeResolve from "rollup-plugin-node-resolve"
import json from "rollup-plugin-json"
import alias from "rollup-plugin-alias"
import run from "rollup-plugin-run"
import babel from "rollup-plugin-babel"
import typescript from "rollup-plugin-typescript2"

const log = logger({timestamp: true})
const {LERNA_PACKAGE_NAME, LERNA_ROOT_PATH, ROLLUP_WATCH} = process.env
const pkg = require(resolve(process.cwd(), "package.json"))
const pkgRoot = require(resolve(LERNA_ROOT_PATH, "package.json"))
const dev = ROLLUP_WATCH === "true"
const obyteLib = LERNA_PACKAGE_NAME === "@obot/lib"
const obyteCli = LERNA_PACKAGE_NAME === "@obot/cli"

const lernaInfo = () => ({
	buildStart: () => log.info(`start building ${LERNA_PACKAGE_NAME} 🚧`),
	generateBundle: output => log.pass(`finish building ${LERNA_PACKAGE_NAME} as ${output.format.toUpperCase()} module 🏁`),
	renderError: error => log.fail(error.message + ' ❌')
})

// #region helper
const mapInput = inputs => {
	const result = {}
	for (const key in inputs) {
		if (!key.includes("*")) Object.assign(result, {[key]: inputs[key]})
		else { // support glob pattern
			const [prefix, suffix] = key.split("*")
			const input = glob(resolve(process.cwd(), inputs[key])).reduce(
				(obj, item) => (obj[`${prefix}/${parse(item).name}${suffix}`] = item, obj), {}
			)
			Object.assign(result, input)
		}
	}
	return result
}
const mapOutput = outputs => outputs.map(output => {
	const ext = output.format === "es" ? "mjs" : "js"
	const dist = output.format === "es" ? pkg.module : pkg.main
	const subdir = outputs.length > 1 ? output.format : ''
	return {
		dir: resolve(dirname(dist), subdir),
		// TODO: try https://github.com/rollup/rollup/issues/2336 when merged
		chunkFileNames: `chunks/[name]-[hash].${ext}`,
		entryFileNames: `[name].${ext}`,
		...output
	}
})
// #endregion

// Rollup Configuration
export default {
	input: obyteCli ? mapInput({
		index: "src/index.ts",
		"commands/*": "src/commands/*.ts"
	}) : "src/index.ts",
	output: mapOutput([
		{exports: "named", format: "cjs"},
		...(obyteLib ? [{exports: "named", format: "es",}] : [])
	]),
	watch: {clearScreen: false},
	// 👇 I wonder if I can convert it as a plugin like rollup-plugin-auto-external 🤔
	external: id => /ocore/.test(id) || /bitcore/.test(id) || /@oclif/.test(id),
	plugins: [
		lernaInfo(),
		(dev && obyteCli) && run({ bin: pkg.bin[pkgRoot.name] }),
		json(),
		obyteLib && alias({
			resolve: [".ts"],
			readline: resolve("./src/shim-readline")
			// 🤔 I"m still uncertain if I need to shim the readline or the stdin/stdout
		}),
		babel(),
		nodeResolve(),
		commonjs(obyteLib ? {ignore: id => id !== "readline"} : {}),
		typescript({
			exclude: ["test/**"],
			tsconfig: resolve(LERNA_ROOT_PATH, "tsconfig.json"),
			// cacheRoot: `${require("temp-dir")}/.rpt2_cache`, // enable this if it's difficult to read the packages structure
			tsconfigOverride: {
				compilerOptions: {
					module: "esnext",
					declaration: true,
					declarationDir: `${process.cwd()}/types`
				}
			},
			useTsconfigDeclarationDir: true
		}),
	],
}