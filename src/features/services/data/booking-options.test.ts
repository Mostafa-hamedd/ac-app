import {
  BOOKING_MOCK_DISCLAIMER,
  estimateCost,
  MAINTENANCE_PACKAGES_KM,
  needsMaintenancePackage,
  TIME_SLOTS,
} from './booking-options';

describe('needsMaintenancePackage', () => {
  it('is true only for regular maintenance', () => {
    expect(needsMaintenancePackage('regularMaintenance')).toBe(true);
    for (const type of [
      'tireService',
      'brakeService',
      'batteryCheck',
      'acService',
      'other',
    ] as const) {
      expect(needsMaintenancePackage(type)).toBe(false);
    }
  });
});

describe('estimateCost', () => {
  it('is unknown for regular maintenance until a package is chosen', () => {
    expect(estimateCost('regularMaintenance', null)).toBeUndefined();
  });

  it('prices each maintenance package (10K matches the Figma 12,000)', () => {
    expect(estimateCost('regularMaintenance', 10)).toBe(12000);
    for (const km of MAINTENANCE_PACKAGES_KM) {
      expect(estimateCost('regularMaintenance', km)).toBeGreaterThan(0);
    }
  });

  it('gives a fixed price for the other services, and "to be quoted" for Other', () => {
    expect(estimateCost('tireService', null)).toBe(800);
    expect(estimateCost('acService', null)).toBe(900);
    expect(estimateCost('other', null)).toBeNull();
  });

  it('ignores the package for services that do not use one', () => {
    expect(estimateCost('tireService', 50)).toBe(800);
  });
});

describe('mock data', () => {
  it('has time slots in order and is documented as fictional', () => {
    expect(TIME_SLOTS).toEqual(['09:00', '10:00', '11:00', '15:30']);
    expect(BOOKING_MOCK_DISCLAIMER).toContain('FICTIONAL MOCK DATA');
  });
});
