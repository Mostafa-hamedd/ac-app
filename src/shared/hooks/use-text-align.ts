import { useTranslation } from 'react-i18next';

/** Classes that right-align a heading or paragraph while the app is in Arabic. */
export function useTextAlign(): string {
  const { i18n } = useTranslation();
  return i18n.language === 'ar' ? 'self-end text-right' : '';
}
