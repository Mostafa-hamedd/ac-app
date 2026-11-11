import { Plus } from 'lucide-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Button } from '@/shared/ui';
import { colors } from '@/theme';

import { useVehicles } from '../hooks/use-vehicles';
import { useVehiclePhotoStore } from '../store/vehicle-photo-store';
import type { VehicleSummary } from '../types/vehicle.types';

/** Keeps the row as tall as its tabs. */
const NO_GROW = { flexGrow: 0 };

/** Height of every tab in the design. */
const TAB_HEIGHT = { height: 41 };

type VehicleTabsProps = {
  /** The Add tab was pressed. */
  onAddVehicle?: () => void;
};

/** "Make Model" for a tab label. */
export function vehicleLabel(vehicle: Pick<VehicleSummary, 'make' | 'model'>): string {
  return `${vehicle.make} ${vehicle.model}`;
}

/** Row of the user's cars to switch between, with an Add tab at the end. */
export function VehicleTabs({ onAddVehicle }: VehicleTabsProps) {
  const { t } = useTranslation();
  const query = useVehicles();
  const vehicles = query.data;
  const selectedId = useVehiclePhotoStore((state) => state.selectedVehicleId);
  const selectVehicle = useVehiclePhotoStore((state) => state.selectVehicle);

  // The first car is selected until the user picks another one.
  const firstId = vehicles?.[0]?.id;
  useEffect(() => {
    if (!selectedId && firstId) selectVehicle(firstId);
  }, [selectedId, firstId, selectVehicle]);

  if (!vehicles) return null;

  return (
    <ScrollView
      horizontal
      // A horizontal ScrollView grows to fill spare height by default, which left a gap below the
      // tabs inside Home's full-height content area.
      style={NO_GROW}
      accessibilityLabel={t('vehicles.myCars')}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2">
      {vehicles.map((vehicle) => {
        const active = vehicle.id === (selectedId ?? firstId);
        return (
          <Button
            key={vehicle.id}
            size="auto"
            variant={active ? 'default' : 'subtle'}
            className="rounded-sm px-4.5"
            style={TAB_HEIGHT}
            textClassName={active ? 'font-sans-semibold' : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            label={vehicleLabel(vehicle)}
            onPress={() => selectVehicle(vehicle.id)}
          />
        );
      })}
      <Button
        size="auto"
        variant="subtle"
        className="gap-1.5 rounded-sm px-3.5"
        style={TAB_HEIGHT}
        textClassName="text-foreground"
        label={t('vehicles.addVehicle')}
        onPress={onAddVehicle}
        leftIcon={<Plus size={14} color={colors.foreground} />}
      />
    </ScrollView>
  );
}
