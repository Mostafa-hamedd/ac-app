module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo already adds the Reanimated/Worklets plugin.
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
