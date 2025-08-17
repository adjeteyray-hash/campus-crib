// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Performance optimizations for mobile only
config.resolver.platforms = ['ios', 'android', 'native'];
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'mjs'];

// Disable strict exports resolution to prevent Node.js module import issues
config.resolver.unstable_enablePackageExports = false;

// Comprehensive resolver configuration for mobile packages
config.resolver.resolverMainFields = ['react-native', 'main'];
config.resolver.alias = {
  ...config.resolver.alias,
  // Force CommonJS versions for problematic ESM packages
  'use-latest-callback': 'use-latest-callback/dist/index.js',
  'merge-options': 'merge-options/dist/index.js',
  // Force the correct util package that includes inherits
  'util': require.resolve('util'),
  'inherits': require.resolve('inherits'),
};

// Redirect Node.js modules to React Native compatible alternatives
config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
  http: require.resolve('stream-http'),
  https: require.resolve('stream-http'),
  url: require.resolve('url'),
  // Ensure we use the correct util package that includes inherits
  util: require.resolve('util'),
  inherits: require.resolve('inherits'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  zlib: require.resolve('browserify-zlib'),
  assert: require.resolve('assert'),
  process: require.resolve('process/browser'),
};

// Enable tree shaking and bundle splitting for mobile
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Optimize bundle size for mobile
config.transformer.optimizePackageImports = [
  '@react-navigation',
  'react-native',
  'expo',
  '@expo/vector-icons',
];

// Enable faster builds
config.transformer.unstable_allowRequireContext = true;

module.exports = config;