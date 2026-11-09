import type { Localized, MaintenanceCenter } from '../data/maintenance-centers';
import type { ResolvedAddress } from './address';
import { distanceKm, type Coordinates } from './distance';

export type Lang = 'en' | 'ar';

/** Where the trip starts: the live GPS position (default) or a point picked on the map. */
export type Origin = { type: 'gps' } | { type: 'custom'; coords: Coordinates };

export type LocationDetails = {
  /** What the sheet is about: the starting point, or the chosen destination center. */
  kind: 'origin' | 'center';
  centerId: string | null;
  title: string;
  /** Short line for the top of the sheet; null while unknown. */
  shortAddress: string | null;
  /** Full address, the one Copy Address copies; null while unknown or unavailable. */
  fullAddress: string | null;
  coords: Coordinates | null;
  /** Straight-line distance from the origin to the center; null for the origin itself. */
  distanceKm: number | null;
  hours: string | null;
  phone: string | null;
};

export const pick = (value: Localized, lang: Lang) => value[lang];

/** The coordinates the trip starts from, or null when GPS has no fix and none was picked. */
export function resolveOriginCoords(
  origin: Origin,
  gpsCoords: Coordinates | null,
): Coordinates | null {
  return origin.type === 'custom' ? origin.coords : gpsCoords;
}

// ---- Search --------------------------------------------------------------

const ARABIC_DIACRITICS = /[ً-ٰٟـ]/g;

/** Lowercase, strip Arabic diacritics/tatweel and unify letter variants so Arabic search is forgiving. */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // Arabic-Indic digits
    .replace(/\s+/g, ' ')
    .trim();
}

function haystack(center: MaintenanceCenter): string {
  // Both languages are searchable regardless of the current UI language.
  return normalizeSearch(
    [
      center.name.en,
      center.name.ar,
      center.area.en,
      center.area.ar,
      center.address.en,
      center.address.ar,
    ].join(' | '),
  );
}

/**
 * Centers matching the query, in either language. Every word must match.
 * Empty query returns all centers. Results are nearest-first when `from` is known.
 */
export function searchCenters(
  query: string,
  centers: readonly MaintenanceCenter[],
  from: Coordinates | null,
): MaintenanceCenter[] {
  const words = normalizeSearch(query).split(' ').filter(Boolean);
  const matches = centers.filter((center) => {
    const text = haystack(center);
    return words.every((word) => text.includes(word));
  });
  if (!from) return matches;
  return [...matches].sort(
    (a, b) =>
      (distanceKm(from, a.coordinates) ?? Infinity) - (distanceKm(from, b.coordinates) ?? Infinity),
  );
}

// ---- Details -------------------------------------------------------------

export type BuildDetailsInput = {
  originCoords: Coordinates | null;
  originIsCustom: boolean;
  /** Address resolved for `originCoords`, or null when unknown / unavailable. */
  originAddress: ResolvedAddress | null;
  destination: MaintenanceCenter | null;
  lang: Lang;
  myLocationLabel: string;
  selectedPointLabel: string;
};

/** Everything the sheet shows. With a destination it describes the center, otherwise the origin. */
export function buildLocationDetails(input: BuildDetailsInput): LocationDetails {
  const { destination, lang, originCoords } = input;

  if (destination) {
    return {
      kind: 'center',
      centerId: destination.id,
      title: pick(destination.name, lang),
      shortAddress: pick(destination.area, lang),
      fullAddress: pick(destination.address, lang),
      coords: destination.coordinates,
      distanceKm: distanceKm(originCoords, destination.coordinates),
      hours: pick(destination.hours, lang),
      phone: destination.phone,
    };
  }

  return {
    kind: 'origin',
    centerId: null,
    title: input.originIsCustom ? input.selectedPointLabel : input.myLocationLabel,
    shortAddress: input.originAddress?.short ?? null,
    fullAddress: input.originAddress?.full ?? null,
    coords: originCoords,
    distanceKm: null,
    hours: null,
    phone: null,
  };
}

/** Text for Copy Address, or null when no address is available for what the sheet shows. */
export function getCopyText(details: LocationDetails): string | null {
  return details.fullAddress;
}

const pair = (c: Coordinates) => `${c.latitude},${c.longitude}`;

/** Google Maps link for the trip (opens the Maps app when installed), or null if nothing to open. */
export function buildMapsUrl(
  originCoords: Coordinates | null,
  destination: Pick<MaintenanceCenter, 'coordinates'> | null,
  fallbackAddress?: string | null,
): string | null {
  const base = 'https://www.google.com/maps';
  if (destination) {
    const origin = originCoords ? `&origin=${pair(originCoords)}` : '';
    return `${base}/dir/?api=1${origin}&destination=${pair(destination.coordinates)}`;
  }
  if (originCoords) return `${base}/search/?api=1&query=${pair(originCoords)}`;
  if (fallbackAddress) {
    return `${base}/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`;
  }
  return null;
}

// ---- Route & camera ------------------------------------------------------

/** Straight line between origin and destination (no routing service is used), or null. */
export function routeLine(
  originCoords: Coordinates | null,
  destination: Pick<MaintenanceCenter, 'coordinates'> | null,
): Coordinates[] | null {
  if (!originCoords || !destination) return null;
  return [originCoords, destination.coordinates];
}

export type CameraTarget = { coordinates: Coordinates; zoom: number };

const MIN_ZOOM = 3;
const MAX_ZOOM = 16;

/** Camera that shows both points (or just `b` when `a` is unknown). */
export function fitCamera(a: Coordinates | null, b: Coordinates): CameraTarget {
  if (!a) return { coordinates: b, zoom: 14 };
  const coordinates = {
    latitude: (a.latitude + b.latitude) / 2,
    longitude: (a.longitude + b.longitude) / 2,
  };
  const latSpan = Math.abs(a.latitude - b.latitude);
  const lonSpan =
    Math.abs(a.longitude - b.longitude) * Math.cos((coordinates.latitude * Math.PI) / 180);
  const span = Math.max(latSpan, lonSpan, 0.0005) * 1.6; // padding
  // A world-wide view (360 degrees) is zoom 0 and each level halves the span.
  const zoom = Math.floor(Math.log2(360 / span)) - 1;
  return { coordinates, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)) };
}
