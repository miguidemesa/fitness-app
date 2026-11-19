// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Vendored third-party code keeps its upstream style.
    ignores: ["dist/*", "src/vendor/*"],
  },
  // Plain apostrophes are fine in React Native <Text>.
  { rules: { "react/no-unescaped-entities": "off" } }
]);
