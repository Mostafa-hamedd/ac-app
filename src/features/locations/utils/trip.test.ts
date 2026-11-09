import { MAINTENANCE_CENTERS, type MaintenanceCenter } from '../data/maintenance-centers';
import {
  buildLocationDetails,
  buildMapsUrl,
  fitCamera,
  getCopyText,
  normalizeSearch,
  resolveOriginCoords,
  routeLine,
  searchCenters,
  type BuildDetailsInput,
} from './trip';

const byId = (id: string) => MAINTENANCE_CENTERS.find((c) => c.id === id) as MaintenanceCenter;
const maadi = byId('maadi');
const nasr = byId('nasr-city');

// A plain test position (downtown Cairo), not a hardcoded app value.
const here = { latitude: 30.0444, longitude: 31.2357 };
const address = { short: '5 Nile St', full: '5 Nile St, Cairo, Egypt' };

function details(overrides: Partial<BuildDetailsInput> = {}) {
  return buildLocationDetails({
    originCoords: here,
    originIsCustom: false,
    originAddress: address,
    destination: null,
    lang: 'en',
    myLocationLabel: 'My location',
    selectedPointLabel: 'Selected point',
    ...overrides,
  });
}

describe('normalizeSearch', () => {
  it('lowercases, trims and collapses spaces', () => {
    expect(normalizeSearch('  New   CAIRO ')).toBe('new cairo');
  });

  it('unifies Arabic letter variants, diacritics and digits', () => {
    expect(normalizeSearch('إلمعادى')).toBe(normalizeSearch('المعادي'));
    expect(normalizeSearch('مَدينة')).toBe(normalizeSearch('مدينه'));
    expect(normalizeSearch('شارع ٩٠')).toBe('شارع 90');
  });
});

describe('searchCenters', () => {
  it('returns every center for an empty query', () => {
    expect(searchCenters('', MAINTENANCE_CENTERS, null)).toHaveLength(MAINTENANCE_CENTERS.length);
    expect(searchCenters('   ', MAINTENANCE_CENTERS, null)).toHaveLength(
      MAINTENANCE_CENTERS.length,
    );
  });

  it('finds centers by English area, name and address', () => {
    expect(searchCenters('maadi', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual(['maadi']);
    expect(searchCenters('Nasr City', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual([
      'nasr-city',
    ]);
    expect(searchCenters('talaat harb', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual([
      'downtown',
    ]);
  });

  it('finds centers by Arabic area, with or without spelling variants', () => {
    expect(searchCenters('المعادي', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual(['maadi']);
    expect(searchCenters('المعادى', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual(['maadi']);
    expect(searchCenters('مدينة نصر', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual([
      'nasr-city',
    ]);
    expect(searchCenters('الشيخ زايد', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual([
      'sheikh-zayed',
    ]);
  });

  it('searches both languages regardless of the UI language', () => {
    expect(searchCenters('هليوبوليس', MAINTENANCE_CENTERS, null)).toHaveLength(0);
    expect(searchCenters('مصر الجديدة', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual([
      'heliopolis',
    ]);
    expect(searchCenters('heliopolis', MAINTENANCE_CENTERS, null).map((c) => c.id)).toEqual([
      'heliopolis',
    ]);
  });

  it('requires every word to match', () => {
    expect(searchCenters('new cairo maadi', MAINTENANCE_CENTERS, null)).toHaveLength(0);
    expect(searchCenters('autoconnect cairo', MAINTENANCE_CENTERS, null).length).toBeGreaterThan(1);
  });

  it('returns nothing for an unknown query', () => {
    expect(searchCenters('zzzz', MAINTENANCE_CENTERS, null)).toEqual([]);
  });

  it('sorts nearest first when the origin is known', () => {
    const sorted = searchCenters('', MAINTENANCE_CENTERS, here);
    expect(sorted[0]?.id).toBe('downtown');
    expect(sorted).toHaveLength(MAINTENANCE_CENTERS.length);
  });
});

describe('resolveOriginCoords', () => {
  it('follows GPS by default and uses the picked point when custom', () => {
    expect(resolveOriginCoords({ type: 'gps' }, here)).toEqual(here);
    expect(resolveOriginCoords({ type: 'gps' }, null)).toBeNull();
    const picked = { latitude: 1, longitude: 2 };
    expect(resolveOriginCoords({ type: 'custom', coords: picked }, here)).toEqual(picked);
  });
});

describe('buildLocationDetails', () => {
  it('describes the live location when there is no destination', () => {
    expect(details()).toMatchObject({
      kind: 'origin',
      title: 'My location',
      shortAddress: '5 Nile St',
      fullAddress: '5 Nile St, Cairo, Egypt',
      coords: here,
      distanceKm: null,
      hours: null,
      phone: null,
    });
  });

  it('describes a picked point with its own label and address', () => {
    const picked = { latitude: 30.1, longitude: 31.3 };
    expect(
      details({
        originCoords: picked,
        originIsCustom: true,
        originAddress: { short: 'X', full: 'X, Cairo' },
      }),
    ).toMatchObject({
      kind: 'origin',
      title: 'Selected point',
      fullAddress: 'X, Cairo',
      coords: picked,
    });
  });

  it('describes the destination center, in the current language, with a real distance', () => {
    const en = details({ destination: maadi });
    expect(en).toMatchObject({
      kind: 'center',
      centerId: 'maadi',
      title: maadi.name.en,
      shortAddress: maadi.area.en,
      fullAddress: maadi.address.en,
      hours: maadi.hours.en,
      phone: maadi.phone,
      coords: maadi.coordinates,
    });
    expect(en.distanceKm).toBeGreaterThan(9);
    expect(en.distanceKm).toBeLessThan(10.5);

    const ar = details({ destination: maadi, lang: 'ar' });
    expect(ar.title).toBe(maadi.name.ar);
    expect(ar.fullAddress).toBe(maadi.address.ar);
  });

  it('has no distance when the origin is unknown', () => {
    expect(details({ destination: maadi, originCoords: null }).distanceKm).toBeNull();
  });
});

describe('getCopyText', () => {
  it('copies the full address of whatever the sheet shows', () => {
    expect(getCopyText(details())).toBe('5 Nile St, Cairo, Egypt');
    expect(getCopyText(details({ destination: nasr }))).toBe(nasr.address.en);
    expect(getCopyText(details({ destination: nasr, lang: 'ar' }))).toBe(nasr.address.ar);
  });

  it('is null when the origin address is unknown', () => {
    expect(getCopyText(details({ originAddress: null }))).toBeNull();
  });
});

describe('buildMapsUrl', () => {
  it('passes both origin and destination', () => {
    expect(buildMapsUrl(here, maadi)).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=30.0444,31.2357&destination=29.9602,31.2569',
    );
  });

  it('omits the origin when it is unknown so Maps uses the live location', () => {
    expect(buildMapsUrl(null, maadi)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=29.9602,31.2569',
    );
  });

  it('opens the origin point when there is no destination', () => {
    expect(buildMapsUrl(here, null)).toBe(
      'https://www.google.com/maps/search/?api=1&query=30.0444,31.2357',
    );
  });

  it('falls back to an address, then to nothing', () => {
    expect(buildMapsUrl(null, null, 'A B')).toBe(
      'https://www.google.com/maps/search/?api=1&query=A%20B',
    );
    expect(buildMapsUrl(null, null)).toBeNull();
  });
});

describe('routeLine', () => {
  it('is a straight line from origin to destination', () => {
    expect(routeLine(here, maadi)).toEqual([here, maadi.coordinates]);
  });

  it('is null unless both ends exist', () => {
    expect(routeLine(null, maadi)).toBeNull();
    expect(routeLine(here, null)).toBeNull();
  });
});

describe('fitCamera', () => {
  it('centres between both points', () => {
    const camera = fitCamera(here, maadi.coordinates);
    expect(camera.coordinates.latitude).toBeCloseTo(
      (here.latitude + maadi.coordinates.latitude) / 2,
    );
    expect(camera.coordinates.longitude).toBeCloseTo(
      (here.longitude + maadi.coordinates.longitude) / 2,
    );
  });

  it('zooms out for far points and in for near ones, within limits', () => {
    const near = fitCamera(here, { latitude: 30.0454, longitude: 31.2367 });
    const far = fitCamera(here, byId('october').coordinates);
    expect(far.zoom).toBeLessThan(near.zoom);
    expect(near.zoom).toBeLessThanOrEqual(16);
    expect(
      fitCamera({ latitude: 0, longitude: 0 }, { latitude: 60, longitude: 170 }).zoom,
    ).toBeGreaterThanOrEqual(3);
  });

  it('just centres the destination when the origin is unknown', () => {
    expect(fitCamera(null, maadi.coordinates)).toEqual({
      coordinates: maadi.coordinates,
      zoom: 14,
    });
  });
});
