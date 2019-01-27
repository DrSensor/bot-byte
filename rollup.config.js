/** TODO: bundler tricks
 * 🔇 shim the console.log on both `bytebeallcore` and `headless-wallet`
 */
import {dirname, resolve, parse} from "path"
import {sync as glob} from "globby"
import {logger} from "@rollup/log"

import commonjs from "rollup-plugin-commonjs"
import nodeResolve from "rollup-plugin-node-resolve"
import json from "rollup-plugin-json"
import babel from "rollup-plugin-babel"
import typescript from "rollup-plugin-typescript2"
const log = logger({timestamp: true})
const {LERNA_PACKAGE_NAME, LERNA_ROOT_PATH, ROLLUP_WATCH} = process.env

const lernaInfo = {
	name: "lerna-info",
	buildStart: () => log.info(`start building ${LERNA_PACKAGE_NAME} 🚧`),
	generateBundle: output => log.pass(`finish building ${LERNA_PACKAGE_NAME} as ${output.format.toUpperCase()} module 🏁`),
	renderError: error => log.fail(error.message + ' ❌')
}

const splice = (items, name, ...item) => ({
	at: (idx, del=0) => {
		items.splice(items.indexOf(name) + idx, del, ...item)
		return {chain: obj => obj}
	}
})

// #region helper
export const pkg = require(resolve(process.cwd(), "package.json"))
export const pkgRoot = require(resolve(LERNA_ROOT_PATH, "package.json"))

export const mapInput = inputs => {
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

export const mapOutput = outputs => outputs.map(output => {
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

export const modify = plugins => ({
	plug: (...plugin) => ({
		before: name => splice(plugins, name, ...plugin).at(0).chain(modify(plugins)),
		after: name => splice(plugins, name, ...plugin).at(1).chain(modify(plugins)),
		replacing: name => splice(plugins, name, ...plugin).at(0, 1).chain(modify(plugins)),
	})
})
// #endregion helper

// Rollup Configuration
export default {
	watch: {clearScreen: false},
	plugins: [
		lernaInfo,
		json(),
		babel(),
		nodeResolve(),
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