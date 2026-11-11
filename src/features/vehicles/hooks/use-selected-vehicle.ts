import { useVehiclePhotoStore } from '../store/vehicle-photo-store';
import type { VehicleSummary } from '../types/vehicle.types';

import { useVehicles } from './use-vehicles';

/** All the user's vehicles, and the one selected on Home (the first until one is picked). */
export function useSelectedVehicle(): {
  vehicles: VehicleSummary[];
  selected: VehicleSummary | undefined;
} {
  const { data } = useVehicles();
  const selectedId = useVehiclePhotoStore((state) => state.selectedVehicleId);
  const vehicles = data ?? [];
  return { vehicles, selected: vehicles.find((item) => item.id === selectedId) ?? vehicles[0] };
}
