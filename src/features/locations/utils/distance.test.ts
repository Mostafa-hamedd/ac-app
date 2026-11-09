import { distanceKm } from './distance';

describe('distanceKm', () => {
  it('is 0 for identical points', () => {
    expect(distanceKm({ latitude: 30, longitude: 31 }, { latitude: 30, longitude: 31 })).toBe(0);
  });

  it('computes a known distance (Cairo to Alexandria is roughly 180 km)', () => {
    const km = distanceKm(
      { latitude: 30.0444, longitude: 31.2357 },
      { latitude: 31.2001, longitude: 29.9187 },
    );
    expect(km).toBeGreaterThan(170);
    expect(km).toBeLessThan(190);
  });

  it('returns null when a point is missing or invalid', () => {
    expect(distanceKm(null, { latitude: 1, longitude: 1 })).toBeNull();
    expect(distanceKm({ latitude: 1, longitude: 1 }, undefined)).toBeNull();
    expect(distanceKm({ latitude: 91, longitude: 0 }, { latitude: 1, longitude: 1 })).toBeNull();
    expect(distanceKm({ latitude: NaN, longitude: 0 }, { latitude: 1, longitude: 1 })).toBeNull();
  });
});
