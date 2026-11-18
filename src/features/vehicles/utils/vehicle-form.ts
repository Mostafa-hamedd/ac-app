import type { FuelType, NewVehicle } from '../types/vehicle.types';

export type VehicleForm = {
  licensePlate: string;
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  fuelType: FuelType | null;
};

export const EMPTY_VEHICLE_FORM: VehicleForm = {
  licensePlate: '',
  vin: '',
  make: null,
  model: null,
  year: null,
  fuelType: null,
};

/** A VIN has 17 letters and digits, and never uses I, O or Q. */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export const normalizeVin = (vin: string) => vin.replace(/\s/g, '').toUpperCase();
export const isValidVin = (vin: string) => VIN_PATTERN.test(normalizeVin(vin));

export function isVehicleFormComplete(form: VehicleForm): boolean {
  return (
    form.licensePlate.trim().length > 0 &&
    isValidVin(form.vin) &&
    !!form.make &&
    !!form.model &&
    form.year !== null &&
    !!form.fuelType
  );
}

/** The request body, or null while the form is incomplete. */
export function toNewVehicle(form: VehicleForm): NewVehicle | null {
  if (!isVehicleFormComplete(form)) return null;
  return {
    licensePlate: form.licensePlate.trim(),
    vin: normalizeVin(form.vin),
    make: form.make!,
    model: form.model!,
    year: form.year!,
    fuelType: form.fuelType!,
  };
}
