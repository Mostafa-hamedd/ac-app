import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Non-sensitive preferences only. Tokens and personal data belong in SecureStore.
 */
export type Language = 'en' | 'ar';

export type Preferences = {
  language: Language;
};

const KEY_PREFIX = 'autoconnect.pref.';

export const preferencesStorage = {
  async get<K extends keyof Preferences>(key: K): Promise<Preferences[K] | null> {
    try {
      const raw = await AsyncStorage.getItem(KEY_PREFIX + key);
      return raw === null ? null : (JSON.parse(raw) as Preferences[K]);
    } catch {
      return null;
    }
  },

  async set<K extends keyof Preferences>(key: K, value: Preferences[K]): Promise<void> {
    await AsyncStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
  },
};
