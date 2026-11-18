import { z } from 'zod';

import { isoDateSchema } from '@/shared/types/api';

export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'] as const;
const fuelTypeSchema = z.enum(FUEL_TYPES);

const vehicleStatusSchema = z.enum(['active', 'in_service', 'needs_attention']);

export const vehicleSummarySchema = z.object({
  id: z.string(),
  nickname: z.string().optional(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  licensePlate: z.string(),
  status: vehicleStatusSchema,
});

export const vehicleSchema = vehicleSummarySchema.extend({
  vin: z.string(),
  fuelType: fuelTypeSchema.optional(),
  color: z.string().optional(),
  mileage: z.number().optional(),
  lastServiceAt: isoDateSchema.optional(),
  nextServiceDueAt: isoDateSchema.optional(),
});

/** What the Add Vehicle form sends. */
export type NewVehicle = {
  licensePlate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
};

export type FuelType = z.infer<typeof fuelTypeSchema>;
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;
export type VehicleSummary = z.infer<typeof vehicleSummarySchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
