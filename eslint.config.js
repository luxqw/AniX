import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    extends: ["next/core-web-vitals"],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": "warn",
    },
  },
];
