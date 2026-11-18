// Public API of the vehicles feature. Import from '@/features/vehicles' only.
export { AddVehicleScreen } from './screens/add-vehicle-screen';
export { UpdatePhotoScreen } from './screens/update-photo-screen';
export { useSelectedVehicle } from './hooks/use-selected-vehicle';
export { VehicleTabs, vehicleLabel } from './components/vehicle-tabs';
export { SelectedVehicleStrip } from './components/selected-vehicle-strip';
export { VehicleHeroCard } from './components/vehicle-hero-card';
export { VehicleDetailScreen } from './screens/vehicle-detail-screen';
export type { FuelType, NewVehicle, Vehicle, VehicleSummary } from './types/vehicle.types';
