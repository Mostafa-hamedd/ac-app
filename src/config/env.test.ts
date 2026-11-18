import type * as EnvModule from './env';

/** env.ts validates process.env when it is first imported, so each case loads it fresh. */
function loadEnv(vars: Record<string, string>) {
  const saved = { ...process.env };
  for (const key of ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_APP_ENV', 'EXPO_PUBLIC_USE_MOCK_API']) {
    delete process.env[key];
  }
  Object.assign(process.env, vars);
  try {
    let loaded: typeof EnvModule | undefined;
    jest.isolateModules(() => {
      loaded = require('./env') as typeof EnvModule;
    });
    return loaded!.env;
  } finally {
    process.env = saved;
  }
}

describe('env', () => {
  it('accepts an https API URL in production', () => {
    const env = loadEnv({
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_API_URL: 'https://api.example.com',
    });
    expect(env.apiUrl).toBe('https://api.example.com');
  });

  it('rejects an http API URL in preview and production', () => {
    for (const appEnv of ['preview', 'production']) {
      expect(() =>
        loadEnv({ EXPO_PUBLIC_APP_ENV: appEnv, EXPO_PUBLIC_API_URL: 'http://api.example.com' }),
      ).toThrow(/https/);
    }
  });

  it('allows an http API URL while developing (local servers)', () => {
    const env = loadEnv({
      EXPO_PUBLIC_APP_ENV: 'development',
      EXPO_PUBLIC_API_URL: 'http://192.168.1.5:3000',
    });
    expect(env.apiUrl).toBe('http://192.168.1.5:3000');
  });

  it('refuses mock mode in production', () => {
    expect(() =>
      loadEnv({ EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_USE_MOCK_API: 'true' }),
    ).toThrow(/Mock API/);
  });

  it('needs an API URL when mock mode is off', () => {
    expect(() => loadEnv({ EXPO_PUBLIC_USE_MOCK_API: 'false' })).toThrow(/EXPO_PUBLIC_API_URL/);
  });
});
