import { parseResponse } from '@/lib/api/api-error';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { paginatedSchema, type Paginated } from '@/shared/types/api';

import {
  vehicleSchema,
  vehicleSummarySchema,
  type Vehicle,
  type VehicleSummary,
} from '../types/vehicle.types';

export async function getVehicles(params?: {
  cursor?: string | null;
}): Promise<Paginated<VehicleSummary>> {
  const { data } = await apiClient.get(endpoints.vehicles.list, {
    params: { cursor: params?.cursor ?? undefined },
  });
  return parseResponse(paginatedSchema(vehicleSummarySchema), data);
}

export async function getVehicleById(vehicleId: string): Promise<Vehicle> {
  const { data } = await apiClient.get(endpoints.vehicles.detail(vehicleId));
  return parseResponse(vehicleSchema, data);
}
