import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Card } from '@/shared/ui/card';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Text } from '@/shared/ui/text';

import type { VehicleSummary } from '../types/vehicle.types';
import { getVehicleStatusDisplay } from '../utils/vehicle-status';

export function VehicleCard({ vehicle }: { vehicle: VehicleSummary }) {
  const status = getVehicleStatusDisplay(vehicle.status);
  const title = vehicle.nickname ?? `${vehicle.make} ${vehicle.model}`;
  return (
    <Link href={{ pathname: '/vehicles/[vehicleId]', params: { vehicleId: vehicle.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${status.label}`}
        className="active:opacity-80">
        <Card>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text variant="large" numberOfLines={1}>
                {title}
              </Text>
              <Text variant="muted" numberOfLines={1}>
                {vehicle.make} {vehicle.model} {vehicle.year} · {vehicle.licensePlate}
              </Text>
            </View>
            <StatusBadge label={status.label} tone={status.tone} />
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
