module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        // Enable tree shaking
        useBuiltIns: 'usage',
        corejs: 3,
      }]
    ],
    plugins: [
      'react-native-reanimated/plugin',
      // Remove console.log in production for better performance
      ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
    ],
    env: {
      production: {
        plugins: [
          'babel-plugin-transform-remove-console',
        ],
      },
    },
  };
};