const reactRefresh = require("eslint-plugin-react-refresh");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
	{
    extends: ["next/core-web-vitals"],
    plugins: {
      "react-refresh": reactRefresh,
    },
		rules: {
			semi: "error",
			"prefer-const": "error",
      "react-refresh/only-export-components": "warn",
		},
	},
]);
