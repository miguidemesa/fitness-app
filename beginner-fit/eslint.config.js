// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  // Plain apostrophes are fine in React Native <Text>.
  { rules: { "react/no-unescaped-entities": "off" } }
]);
