import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NewVehicle } from '../types/vehicle.types';
import { createVehicle } from '../api/vehicles.api';

/** Adds a vehicle, then refreshes every vehicle list and detail. */
export function useAddVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewVehicle) => createVehicle(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}
