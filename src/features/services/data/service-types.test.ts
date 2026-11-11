import { i18n } from '@/lib/i18n';

import { SERVICE_TYPES } from './service-types';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

describe('SERVICE_TYPES', () => {
  it('has the six Figma service types with unique ids and an icon each', () => {
    expect(SERVICE_TYPES.map((type) => type.id)).toEqual([
      'regularMaintenance',
      'tireService',
      'brakeService',
      'batteryCheck',
      'acService',
      'other',
    ]);
    for (const type of SERVICE_TYPES) expect(type.icon).toBeTruthy();
  });

  it('has a label in English and Arabic for each type', () => {
    for (const type of SERVICE_TYPES) {
      const key = `services.types.${type.id}`;
      expect(i18n.exists(key, { lng: 'en' })).toBe(true);
      expect(i18n.exists(key, { lng: 'ar' })).toBe(true);
    }
  });
});
