// Global test setup. Keep this file small; per-test mocks belong in tests/mocks.
process.env.EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.test.local';
process.env.EXPO_PUBLIC_USE_MOCK_API = 'true';

// Use React Native's FormData (as on a device) instead of Node's, so file uploads behave the same.
globalThis.FormData = require('react-native/Libraries/Network/FormData').default;

jest.mock('expo-secure-store', () => require('./tests/mocks/expo-secure-store'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// API calls in tests are answered by the same fake backend the app uses in mock mode.
// Required (not imported) so it loads after the environment variables above are set.
require('./src/mocks/install');
