import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

import { useVehicles } from '../hooks/use-vehicles';
import { useVehiclePhotoStore } from '../store/vehicle-photo-store';

import { VehiclePhoto } from './vehicle-photo';
import { vehicleLabel } from './vehicle-tabs';

/** The car being worked on: its photo, name, and plate with year. Hidden until the cars load. */
export function SelectedVehicleStrip({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const { data: vehicles } = useVehicles();
  const selectedId = useVehiclePhotoStore((state) => state.selectedVehicleId);
  const vehicle = vehicles?.find((item) => item.id === selectedId) ?? vehicles?.[0];

  if (!vehicle) return null;

  return (
    <View
      className={cn(
        'items-center gap-3 rounded-lg border border-border bg-card p-3',
        i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row',
        className,
      )}>
      <VehiclePhoto className="size-10 rounded-md" iconSize={20} />
      <View className="flex-1">
        <Text className="font-sans-medium text-sm">{vehicleLabel(vehicle)}</Text>
        <Text variant="muted">
          {vehicle.licensePlate} · {vehicle.year}
        </Text>
      </View>
    </View>
  );
}
