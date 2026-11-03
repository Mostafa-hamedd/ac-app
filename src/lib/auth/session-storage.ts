import * as SecureStore from 'expo-secure-store';

/**
 * Persists session tokens in the platform keychain / keystore.
 * Align what is stored with the backend's auth design (e.g. refresh token only).
 */
const ACCESS_TOKEN_KEY = 'autoconnect.accessToken';
const REFRESH_TOKEN_KEY = 'autoconnect.refreshToken';

export type StoredTokens = {
  accessToken: string;
  refreshToken?: string;
};

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

// Kept in memory so the request interceptor doesn't hit SecureStore on every call.
let cachedAccessToken: string | null = null;

export const tokenStorage = {
  async load(): Promise<StoredTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY, options),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY, options),
    ]);
    cachedAccessToken = accessToken;
    if (!accessToken) return null;
    return { accessToken, refreshToken: refreshToken ?? undefined };
  },

  async save(tokens: StoredTokens): Promise<void> {
    cachedAccessToken = tokens.accessToken;
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken, options);
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken, options);
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, options);
    }
  },

  async clear(): Promise<void> {
    cachedAccessToken = null;
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY, options),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, options),
    ]);
  },

  getAccessToken(): string | null {
    return cachedAccessToken;
  },
};
