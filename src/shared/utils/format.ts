import { i18n } from '@/lib/i18n';

/** Formatting in the app's current language. */

export function formatDate(iso: string, locale = i18n.language): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatNumber(value: number, locale = i18n.language): string {
  return new Intl.NumberFormat(locale).format(value);
}
