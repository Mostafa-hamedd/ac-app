import { z } from 'zod';

import { isoDateSchema } from '@/shared/types/api';

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
  color: z.string().optional(),
  mileage: z.number().optional(),
  lastServiceAt: isoDateSchema.optional(),
  nextServiceDueAt: isoDateSchema.optional(),
});

export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;
export type VehicleSummary = z.infer<typeof vehicleSummarySchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
