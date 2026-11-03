const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// The fake backend in src/mocks is bundled only in mock mode, so production builds
// never contain mock code, demo users or sample data.
if (process.env.EXPO_PUBLIC_USE_MOCK_API !== 'true') {
  const resolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === '@/mocks/install') {
      return { type: 'sourceFile', filePath: path.join(__dirname, 'src/mocks/noop.ts') };
    }
    return (resolveRequest ?? context.resolveRequest)(context, moduleName, platform);
  };
}

// inlineRem 16 makes the spacing scale the usual 4dp grid (p-4 = 16dp) on native too.
module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });
