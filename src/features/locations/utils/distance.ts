export type Coordinates = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;

function isValid(c: Partial<Coordinates> | null | undefined): c is Coordinates {
  return (
    !!c &&
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude) &&
    Math.abs(c.latitude as number) <= 90 &&
    Math.abs(c.longitude as number) <= 180
  );
}

/** Great-circle distance in km, or null when either point is missing or invalid. */
export function distanceKm(
  from: Partial<Coordinates> | null | undefined,
  to: Partial<Coordinates> | null | undefined,
): number | null {
  if (!isValid(from) || !isValid(to)) return null;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(to.latitude - from.latitude);
  const dLon = rad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(from.latitude)) * Math.cos(rad(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}
