import { z } from 'zod';

/**
 * Public, non-secret runtime configuration. Validated once at startup so a
 * missing value fails loudly instead of surfacing later as a network error.
 *
 * Expo inlines `process.env.EXPO_PUBLIC_*` at build time, so each variable must
 * be referenced explicitly (no dynamic access).
 */
const envSchema = z
  .object({
    // Required only in real-API mode (see the useMockApi check below) — mock mode
    // never calls the backend, so it never needs a URL.
    EXPO_PUBLIC_API_URL: z.url().optional(),
    EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']).default('development'),
    EXPO_PUBLIC_LINK_DOMAIN: z.string().min(1).optional(),
    // "true" answers every API call from the fake backend in src/mocks. Off unless set,
    // matching metro.config.js, which only bundles the mocks when this is "true".
    EXPO_PUBLIC_USE_MOCK_API: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .check((ctx) => {
    if (!ctx.value.EXPO_PUBLIC_USE_MOCK_API && !ctx.value.EXPO_PUBLIC_API_URL) {
      ctx.issues.push({
        code: 'custom',
        message: 'Required when EXPO_PUBLIC_USE_MOCK_API is not "true".',
        input: ctx.value.EXPO_PUBLIC_API_URL,
        path: ['EXPO_PUBLIC_API_URL'],
      });
    }
    // Mock mode signs anyone in with any password, so it must never reach users.
    if (ctx.value.EXPO_PUBLIC_USE_MOCK_API && ctx.value.EXPO_PUBLIC_APP_ENV === 'production') {
      ctx.issues.push({
        code: 'custom',
        message: 'Mock API cannot be used in production. Set EXPO_PUBLIC_USE_MOCK_API=false.',
        input: ctx.value.EXPO_PUBLIC_USE_MOCK_API,
        path: ['EXPO_PUBLIC_USE_MOCK_API'],
      });
    }
  });

const parsed = envSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_LINK_DOMAIN: process.env.EXPO_PUBLIC_LINK_DOMAIN,
  EXPO_PUBLIC_USE_MOCK_API: process.env.EXPO_PUBLIC_USE_MOCK_API,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration. Copy .env.example to .env.local and fill it in.\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = {
  apiUrl: parsed.data.EXPO_PUBLIC_API_URL,
  appEnv: parsed.data.EXPO_PUBLIC_APP_ENV,
  linkDomain: parsed.data.EXPO_PUBLIC_LINK_DOMAIN,
  isDev: parsed.data.EXPO_PUBLIC_APP_ENV === 'development',
  /** When true, API calls are answered by the fake backend in src/mocks. */
  useMockApi: parsed.data.EXPO_PUBLIC_USE_MOCK_API,
} as const;
