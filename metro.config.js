const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  "react-native-element-dropdown": require.resolve("react-native-element-dropdown"),
};

module.exports = defaultConfig;
