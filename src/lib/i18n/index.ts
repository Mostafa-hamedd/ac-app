import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { preferencesStorage, type Language } from '@/lib/storage/preferences-storage';

import { ar } from './locales/ar';
import { en } from './locales/en';

export type { Language };

const i18n = createInstance();

// Resources are bundled, so init completes synchronously and `t` works on first render.
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: 'en',
  fallbackLng: 'en',
  initAsync: false,
  interpolation: { escapeValue: false }, // React already escapes rendered values.
});

/** Applies the language saved on this device, if there is one. */
export async function restoreLanguage(): Promise<void> {
  const saved = await preferencesStorage.get('language');
  if (saved) await i18n.changeLanguage(saved);
}

/** Switches the UI immediately; a failed save only means it won't survive a restart. */
export async function setLanguage(language: Language): Promise<void> {
  await i18n.changeLanguage(language);
  try {
    await preferencesStorage.set('language', language);
  } catch {
    // Non-critical preference: keep the language for this session.
  }
}

export { i18n };
