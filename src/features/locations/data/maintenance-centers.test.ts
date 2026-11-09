import { MAINTENANCE_CENTERS, MOCK_DATA_DISCLAIMER } from './maintenance-centers';

describe('MAINTENANCE_CENTERS mock data', () => {
  it('has unique ids and complete bilingual details', () => {
    const ids = MAINTENANCE_CENTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const center of MAINTENANCE_CENTERS) {
      for (const field of [center.name, center.area, center.address, center.hours]) {
        expect(field.en.trim()).not.toBe('');
        expect(field.ar.trim()).not.toBe('');
      }
      expect(center.phone).toMatch(/^\+20 2 5550 \d{4}$/);
    }
  });

  it('places every center inside greater Cairo', () => {
    for (const { coordinates } of MAINTENANCE_CENTERS) {
      expect(coordinates.latitude).toBeGreaterThan(29.8);
      expect(coordinates.latitude).toBeLessThan(30.3);
      expect(coordinates.longitude).toBeGreaterThan(30.8);
      expect(coordinates.longitude).toBeLessThan(31.7);
    }
  });

  it('covers the requested districts', () => {
    const areas = MAINTENANCE_CENTERS.map((c) => c.area.en);
    for (const area of [
      'Nasr City',
      'New Cairo',
      'Maadi',
      'Heliopolis',
      'Sheikh Zayed',
      '6th of October',
    ]) {
      expect(areas).toContain(area);
    }
  });

  it('is documented as fictional', () => {
    expect(MOCK_DATA_DISCLAIMER).toContain('FICTIONAL MOCK DATA');
  });
});
