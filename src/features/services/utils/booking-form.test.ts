import { isBookingComplete, isServiceTypeId, type BookingForm } from './booking-form';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

const filled: BookingForm = {
  serviceType: 'tireService',
  packageKm: null,
  vehicleId: 'VEH_1',
  centerId: 'maadi',
  date: new Date(2026, 10, 20),
  time: '09:00',
  notes: '',
};

describe('isServiceTypeId', () => {
  it('accepts the known service types only', () => {
    expect(isServiceTypeId('regularMaintenance')).toBe(true);
    expect(isServiceTypeId('other')).toBe(true);
    expect(isServiceTypeId('nonsense')).toBe(false);
    expect(isServiceTypeId(undefined)).toBe(false);
    expect(isServiceTypeId(42)).toBe(false);
  });
});

describe('isBookingComplete', () => {
  it('is complete for a non-maintenance service without notes or a package', () => {
    expect(isBookingComplete(filled)).toBe(true);
  });

  it('needs a vehicle, a center, a date and a time slot', () => {
    expect(isBookingComplete({ ...filled, vehicleId: null })).toBe(false);
    expect(isBookingComplete({ ...filled, centerId: null })).toBe(false);
    expect(isBookingComplete({ ...filled, date: null })).toBe(false);
    expect(isBookingComplete({ ...filled, time: null })).toBe(false);
  });

  it('needs a maintenance package for regular maintenance', () => {
    const maintenance = { ...filled, serviceType: 'regularMaintenance' as const };
    expect(isBookingComplete(maintenance)).toBe(false);
    expect(isBookingComplete({ ...maintenance, packageKm: 10 })).toBe(true);
  });

  it('does not require notes', () => {
    expect(isBookingComplete({ ...filled, notes: '' })).toBe(true);
    expect(isBookingComplete({ ...filled, notes: 'Squeaking noise' })).toBe(true);
  });
});
