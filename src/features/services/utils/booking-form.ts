import { needsMaintenancePackage } from '../data/booking-options';
import { SERVICE_TYPES, type ServiceTypeId } from '../data/service-types';

export type BookingForm = {
  serviceType: ServiceTypeId;
  /** Maintenance package in thousands of km (regular maintenance only). */
  packageKm: number | null;
  vehicleId: string | null;
  centerId: string | null;
  date: Date | null;
  /** "HH:mm". */
  time: string | null;
  notes: string;
};

/** Narrows a route parameter to a service type id. */
export function isServiceTypeId(value: unknown): value is ServiceTypeId {
  return SERVICE_TYPES.some((type) => type.id === value);
}

/**
 * Whether every required field is filled in. Regular maintenance needs a package;
 * the other services take free-text notes, which are optional.
 */
export function isBookingComplete(form: BookingForm): boolean {
  if (needsMaintenancePackage(form.serviceType) && form.packageKm === null) return false;
  return !!form.vehicleId && !!form.centerId && !!form.date && !!form.time;
}
