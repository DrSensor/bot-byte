import {resolve} from "path"

import rootConfig, {mapOutput, modify} from "../../rollup.config"
import commonjs from "rollup-plugin-commonjs"
import alias from "rollup-plugin-alias"

modify(rootConfig.plugins)
.plug(
	commonjs({
		ignore: id => id !== "readline"
	})
).after("node-resolve")

.plug(
	alias({
		resolve: [".ts"],
		readline: resolve("./src/shim-readline")
		// 🤔 I"m still uncertain if I need to shim the readline or the stdin/stdout
	})
).before("babel")

export default {
	input: "src/index.ts",
	output: mapOutput([
		{exports: "named", format: "cjs"},
		{exports: "named", format: "es"},
	]),
	external: id => /^ocore|^bitcore/.test(id),
	...rootConfig
}