import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/shared/ui';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { formatNumber } from '@/shared/utils/format';
import { colors } from '@/theme';

import { useSelectedVehicle } from '../hooks/use-selected-vehicle';
import { useVehiclePhotoStore } from '../store/vehicle-photo-store';
import type { VehicleSummary } from '../types/vehicle.types';

import { vehicleLabel } from './vehicle-tabs';
import { VehiclePhoto } from './vehicle-photo';

/** Top corner radius of the sheet in the design. */
const SHEET_RADIUS = 32;

export type VehicleSelectorSheetProps = { ref?: React.Ref<BottomSheetModal> };

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />;
}

/** "Electric · 2024 · 12,450 km": whatever of fuel, year and mileage is known. */
function useVehicleSubtitle() {
  const { t } = useTranslation();
  return (vehicle: VehicleSummary) =>
    [
      vehicle.fuelType ? t(`vehicles.add.fuel.${vehicle.fuelType}`) : null,
      String(vehicle.year),
      vehicle.mileage !== undefined
        ? t('vehicles.selector.mileageKm', { mileage: formatNumber(vehicle.mileage) })
        : null,
    ]
      .filter(Boolean)
      .join(' · ');
}

/**
 * "My Vehicles" sheet: choose which car My Garage shows, or add a new one. The choice is only
 * applied when Done is pressed.
 */
export function VehicleSelectorSheet({ ref }: VehicleSelectorSheetProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const row = isArabic ? 'flex-row-reverse' : 'flex-row';
  const { vehicles, selected } = useSelectedVehicle();
  const photos = useVehiclePhotoStore((state) => state.photos);
  const selectVehicle = useVehiclePhotoStore((state) => state.selectVehicle);
  const subtitle = useVehicleSubtitle();
  // The pick before Done is pressed; null means "still the one already selected".
  const [draftId, setDraftId] = useState<string | null>(null);
  const activeId = draftId ?? selected?.id;

  function close() {
    if (ref && typeof ref === 'object') ref.current?.dismiss();
  }

  function done() {
    if (draftId) selectVehicle(draftId);
    close();
  }

  function edit(vehicleId: string) {
    close();
    router.push({ pathname: '/edit-vehicle', params: { vehicleId } });
  }

  function addNew() {
    close();
    router.push('/add-vehicle');
  }

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      onDismiss={() => setDraftId(null)}
      backdropComponent={Backdrop}
      backgroundStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: SHEET_RADIUS,
        borderTopRightRadius: SHEET_RADIUS,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 36, height: 5 }}>
      <BottomSheetScrollView contentContainerClassName="gap-6 px-6 pb-6 pt-3">
        <View className={cn(row, 'items-center justify-between')}>
          <Text accessibilityRole="header" className="font-sans-semibold text-lg">
            {t('vehicles.selector.title')}
          </Text>
          {activeId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('vehicles.selector.edit')}
              onPress={() => edit(activeId)}
              className="h-9 items-center justify-center rounded-full border border-border px-4 active:opacity-80">
              <Text className="font-sans-semibold text-xs">{t('vehicles.selector.edit')}</Text>
            </Pressable>
          ) : null}
        </View>

        <View className="gap-3">
          {vehicles.map((vehicle) => {
            const active = vehicle.id === activeId;
            return (
              <Pressable
                key={vehicle.id}
                accessibilityRole="radio"
                accessibilityLabel={t('vehicles.selector.select', {
                  vehicle: vehicleLabel(vehicle),
                })}
                accessibilityState={{ selected: active }}
                onPress={() => setDraftId(vehicle.id)}
                className={cn(
                  row,
                  'items-center justify-between gap-3 rounded-lg border p-4 active:opacity-80',
                  active ? 'border-primary bg-sheet' : 'border-border bg-card',
                )}>
                <View className={cn(row, 'flex-1 items-center gap-3')}>
                  <VehiclePhoto
                    uri={photos[vehicle.id] ?? null}
                    iconSize={24}
                    className="size-14 overflow-hidden rounded-xs"
                  />
                  <View className={cn('flex-1 gap-0.5', isArabic ? 'items-end' : 'items-start')}>
                    <Text className="font-sans-semibold text-subhead">{vehicleLabel(vehicle)}</Text>
                    <Text className="text-xs text-placeholder">{subtitle(vehicle)}</Text>
                  </View>
                </View>
                <View
                  className={cn(
                    'size-5 rounded-full border',
                    active ? 'border-primary bg-primary' : 'border-border bg-card',
                  )}
                />
              </Pressable>
            );
          })}
        </View>

        <View className="gap-3">
          <Button
            variant="outline"
            label={t('vehicles.selector.addNew')}
            onPress={addNew}
            leftIcon={({ color }) => <Plus size={16} color={color} />}
          />
          <Button label={t('vehicles.selector.done')} onPress={done} />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
