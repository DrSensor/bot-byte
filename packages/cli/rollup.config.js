import rootConfig, {mapInput, mapOutput, modify, pkg, pkgRoot, at} from "../../rollup.config"
import run from "rollup-plugin-run"

if (process.env.ROLLUP_WATCH === "true") modify(rootConfig.plugins)
.plug(
	run({bin: pkg.bin[pkgRoot.name]})
).after("lerna-info")

export default {
	input: mapInput({
		index: "src/index.ts",
		"commands/*": "src/commands/*.ts"
	}),
	output: mapOutput([
		{exports: "named", format: "cjs"},
	]),
	external: id => /^@oclif/.test(id),
	...rootConfig
}