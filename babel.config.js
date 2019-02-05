module.exports = {
	presets: [
		["@babel/env", {
			targets: { node: "current" },
			modules: false
		}], "@babel/preset-typescript"
	],
	plugins: [
		"@babel/proposal-export-namespace-from",
		"@babel/proposal-class-properties",
		"@babel/proposal-object-rest-spread",
		"@babel/plugin-proposal-numeric-separator",
		"@babel/plugin-syntax-dynamic-import"
	]
}