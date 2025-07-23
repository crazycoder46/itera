const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable static rendering for web builds
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Disable static rendering
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'web'],
};

module.exports = config; 