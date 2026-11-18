// Public API of the vehicles feature. Import from '@/features/vehicles' only.
export { AddVehicleScreen } from './screens/add-vehicle-screen';
export { EditVehicleScreen } from './screens/edit-vehicle-screen';
export { UpdatePhotoScreen } from './screens/update-photo-screen';
export { useResetVehicleSelectionOnExit } from './hooks/use-reset-vehicle-selection';
export { useSelectedVehicle } from './hooks/use-selected-vehicle';
export { VehicleSelectorSheet } from './components/vehicle-selector-sheet';
export { VehicleTabs, vehicleLabel } from './components/vehicle-tabs';
export { SelectedVehicleStrip } from './components/selected-vehicle-strip';
export { VehicleHeroCard } from './components/vehicle-hero-card';
export { VehicleDetailScreen } from './screens/vehicle-detail-screen';
export type {
  FuelType,
  NewVehicle,
  Vehicle,
  VehicleSummary,
  VehicleUpdate,
} from './types/vehicle.types';
