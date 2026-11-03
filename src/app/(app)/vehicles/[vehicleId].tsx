import { useLocalSearchParams } from 'expo-router';

import { VehicleDetailScreen } from '@/features/vehicles';

export default function VehicleDetailRoute() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  return <VehicleDetailScreen vehicleId={vehicleId} />;
}
