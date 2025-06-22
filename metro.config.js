const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Add path resolver for @ alias
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@': path.resolve(__dirname, 'src'),
  },
};

module.exports = withNativeWind(config, { input: './global.css' });