export type ResolvedAddress = { short: string; full: string };

/** The subset of expo-location's reverse-geocode result that we format. */
export type GeocodedAddress = {
  name?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  district?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  formattedAddress?: string | null;
};

const clean = (value: string | null | undefined) => value?.trim() || null;

/** Turns a reverse-geocode result into a short + full address, or null if it has nothing usable. */
export function formatAddress(geo: GeocodedAddress | null | undefined): ResolvedAddress | null {
  if (!geo) return null;
  const street = clean(geo.street);
  const streetLine = street
    ? [clean(geo.streetNumber), street].filter(Boolean).join(' ')
    : clean(geo.name);

  const parts: string[] = [];
  for (const part of [
    streetLine,
    clean(geo.district),
    clean(geo.city),
    clean(geo.region),
    clean(geo.country),
  ]) {
    if (part && !parts.includes(part)) parts.push(part);
  }

  const full = clean(geo.formattedAddress) ?? (parts.length ? parts.join(', ') : null);
  if (!full) return null;
  return { short: streetLine ?? parts[0] ?? full, full };
}
