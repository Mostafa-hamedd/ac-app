import type { ServiceTypeId } from './service-types';

/** FICTIONAL MOCK DATA: invented prices and slots. Replace with API data when a backend exists. */
export const BOOKING_MOCK_DISCLAIMER =
  'FICTIONAL MOCK DATA: invented maintenance packages, prices and time slots.';

/** Regular-maintenance packages, in thousands of km. */
export const MAINTENANCE_PACKAGES_KM: readonly number[] = [5, 10, 20, 30, 40, 50];

/** EGP, by maintenance package (thousands of km). */
const MAINTENANCE_PRICES: Record<number, number> = {
  5: 2500,
  10: 12000,
  20: 15000,
  30: 18000,
  40: 22000,
  50: 26000,
};

/** EGP for the other services. `null` means the price is quoted after inspection. */
const OTHER_PRICES: Record<Exclude<ServiceTypeId, 'regularMaintenance'>, number | null> = {
  tireService: 800,
  brakeService: 1500,
  batteryCheck: 1200,
  acService: 900,
  other: null,
};

/** Appointment start times, 24-hour "HH:mm". */
export const TIME_SLOTS: readonly string[] = ['09:00', '10:00', '11:00', '15:30'];

/** Only regular maintenance is booked by mileage package. */
export function needsMaintenancePackage(type: ServiceTypeId): boolean {
  return type === 'regularMaintenance';
}

/**
 * The estimated cost in EGP, `null` when it will be quoted later, or `undefined` when it
 * cannot be known yet (regular maintenance with no package chosen).
 */
export function estimateCost(
  type: ServiceTypeId,
  packageKm: number | null,
): number | null | undefined {
  if (type === 'regularMaintenance') {
    return packageKm === null ? undefined : (MAINTENANCE_PRICES[packageKm] ?? null);
  }
  return OTHER_PRICES[type];
}
