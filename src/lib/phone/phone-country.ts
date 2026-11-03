import { COUNTRIES, type Country } from './countries';

export type { Country };

/** The app's home market, selected until the user picks another country. */
export const DEFAULT_COUNTRY_VALUE = 'EG';

/** ITU E.164 limits, for countries whose phone length is unknown. */
const FALLBACK_MIN_LENGTH = 4;
const FALLBACK_MAX_LENGTH = 15;

const defaultCountry = COUNTRIES.find((country) => country.code === DEFAULT_COUNTRY_VALUE)!;

export function getCountry(code?: string): Country {
  return COUNTRIES.find((country) => country.code === code) ?? defaultCountry;
}

export function getCountryName(country: Country, language: string): string {
  return language === 'ar' ? country.name.ar : country.name.en;
}

export function formatDialCode(country: Country): string {
  return `+${country.dialCode}`;
}

/** The country's flag as an emoji, built from its two-letter code (no image download needed). */
export function getFlagEmoji(country: Country): string {
  return String.fromCodePoint(...[...country.code].map((char) => 0x1f1a5 + char.charCodeAt(0)));
}

export function getMaxPhoneLength(country: Country): number {
  return country.phoneLengths ? Math.max(...country.phoneLengths) : FALLBACK_MAX_LENGTH;
}

export function isValidPhoneLength(country: Country, length: number): boolean {
  if (country.phoneLengths) return country.phoneLengths.includes(length);
  return length >= FALLBACK_MIN_LENGTH && length <= FALLBACK_MAX_LENGTH;
}

export function searchCountries(query: string): Country[] {
  const term = query.trim().toLowerCase().replace(/^\+/, '');
  if (!term) return COUNTRIES;
  return COUNTRIES.filter(
    ({ name, dialCode }) =>
      name.en.toLowerCase().includes(term) || name.ar.includes(term) || dialCode.includes(term),
  );
}
