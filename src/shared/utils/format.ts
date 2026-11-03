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

/**
 * `amountMinor` is in the currency's smallest unit. Not every currency has 2 decimals
 * (JPY has 0, KWD has 3), so the divisor comes from the currency itself.
 */
export function formatCurrency(amountMinor: number, currency: string, locale = i18n.language) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const decimals = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(amountMinor / 10 ** decimals);
}
