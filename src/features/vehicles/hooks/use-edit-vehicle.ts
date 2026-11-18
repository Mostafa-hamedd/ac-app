import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteVehicle, updateVehicle } from '../api/vehicles.api';
import type { VehicleUpdate } from '../types/vehicle.types';

/** Saves changes to a vehicle, then refreshes every vehicle list and detail. */
export function useUpdateVehicle(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleUpdate) => updateVehicle(vehicleId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

/** Removes a vehicle, then refreshes every vehicle list and detail. */
export function useDeleteVehicle(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteVehicle(vehicleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}
