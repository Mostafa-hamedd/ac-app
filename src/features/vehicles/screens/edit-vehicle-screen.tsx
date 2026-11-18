import { router, useLocalSearchParams } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { Button, Input } from '@/shared/ui';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingState } from '@/shared/ui/loading-state';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { VehiclePhoto } from '../components/vehicle-photo';
import { DropdownField, FormField } from '../components/vehicle-form-fields';
import { MAKES, MODELS_BY_MAKE, modelYears } from '../data/vehicle-options';
import { useDeleteVehicle, useUpdateVehicle } from '../hooks/use-edit-vehicle';
import { useVehicle } from '../hooks/use-vehicles';
import { useVehiclePhotoStore } from '../store/vehicle-photo-store';
import type { Vehicle, VehicleUpdate } from '../types/vehicle.types';
import { isValidVin, normalizeVin } from '../utils/vehicle-form';

type EditForm = {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  mileage: string;
};

function EditVehicleForm({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useTranslation();
  const updateVehicle = useUpdateVehicle(vehicle.id);
  const deleteVehicle = useDeleteVehicle(vehicle.id);
  const selectVehicle = useVehiclePhotoStore((state) => state.selectVehicle);
  const photo = useVehiclePhotoStore((state) => state.photos[vehicle.id] ?? null);

  const [form, setForm] = useState<EditForm>({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.licensePlate,
    vin: vehicle.vin,
    mileage: vehicle.mileage === undefined ? '' : String(vehicle.mileage),
  });
  const [vinTouched, setVinTouched] = useState(false);

  const update = (changes: Partial<EditForm>) => setForm((current) => ({ ...current, ...changes }));
  const models = MODELS_BY_MAKE[form.make] ?? [form.model];
  // Keep the car's own make and year pickable even if the sample lists do not include them.
  const makes = MAKES.includes(form.make) ? MAKES : [form.make, ...MAKES];
  const years = [...new Set([vehicle.year, ...modelYears(new Date().getFullYear())])]
    .sort((a, b) => b - a)
    .map(String);
  const vinError = vinTouched && !isValidVin(form.vin) ? t('vehicles.add.vinInvalid') : undefined;
  const complete = !!form.licensePlate.trim() && !!form.model && isValidVin(form.vin);

  // Update Photo works on the selected vehicle, so make this one the selected one first.
  function changePhoto() {
    selectVehicle(vehicle.id);
    router.push('/update-photo');
  }

  async function submit() {
    if (!complete) return;
    const mileage = Number(form.mileage.replace(/[^\d]/g, ''));
    const input: VehicleUpdate = {
      licensePlate: form.licensePlate.trim(),
      vin: normalizeVin(form.vin),
      make: form.make,
      model: form.model,
      year: form.year,
      ...(form.mileage.trim() && Number.isFinite(mileage) ? { mileage } : {}),
    };
    try {
      await updateVehicle.mutateAsync(input);
      router.back();
    } catch {
      Alert.alert(t('vehicles.edit.failed'));
    }
  }

  function confirmDelete() {
    Alert.alert(t('vehicles.edit.deleteTitle'), t('vehicles.edit.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('vehicles.edit.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVehicle.mutateAsync();
            router.back();
          } catch {
            Alert.alert(t('vehicles.edit.deleteFailed'));
          }
        },
      },
    ]);
  }

  return (
    <Screen
      preset="keyboard"
      edges={['bottom']}
      className="bg-sheet"
      contentClassName="gap-4 px-6 pb-8 pt-2">
      <VehiclePhoto uri={photo} className="h-40 w-full rounded-xl">
        <View className="absolute end-3 top-3">
          <Button
            variant="light"
            size="icon"
            accessibilityLabel={t('vehicles.changePhoto')}
            onPress={changePhoto}
            leftIcon={({ color }) => <Camera size={16} color={color} />}
          />
        </View>
      </VehiclePhoto>

      <DropdownField
        label={t('vehicles.add.make')}
        placeholder={t('vehicles.add.selectMake')}
        options={makes}
        value={form.make}
        // A different make has different models, so the model must be chosen again.
        onChange={(make) =>
          update({
            make,
            model: make === form.make ? form.model : (MODELS_BY_MAKE[make]?.[0] ?? ''),
          })
        }
      />
      <DropdownField
        label={t('vehicles.add.model')}
        placeholder={t('vehicles.add.selectModel')}
        options={models}
        value={form.model}
        onChange={(model) => update({ model })}
      />
      <DropdownField
        label={t('vehicles.add.year')}
        placeholder={t('vehicles.add.selectYear')}
        options={years}
        value={String(form.year)}
        onChange={(year) => update({ year: Number(year) })}
      />

      <FormField label={t('vehicles.add.licensePlate')}>
        <Input
          variant="outline"
          accessibilityLabel={t('vehicles.add.licensePlate')}
          value={form.licensePlate}
          onChangeText={(licensePlate) => update({ licensePlate })}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </FormField>
      <FormField label={t('vehicles.add.vin')}>
        <Input
          variant="outline"
          accessibilityLabel={t('vehicles.add.vin')}
          value={form.vin}
          onChangeText={(vin) => update({ vin })}
          onBlur={() => setVinTouched(true)}
          error={vinError}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={17}
        />
      </FormField>
      <FormField label={t('vehicles.edit.mileage')}>
        <Input
          variant="outline"
          accessibilityLabel={t('vehicles.edit.mileage')}
          value={form.mileage}
          onChangeText={(mileage) => update({ mileage })}
          keyboardType="number-pad"
        />
      </FormField>

      <View className="gap-5 pt-4">
        <Button
          label={t('vehicles.edit.submit')}
          disabled={!complete}
          loading={updateVehicle.isPending}
          onPress={submit}
        />
        <Pressable
          accessibilityRole="button"
          onPress={confirmDelete}
          disabled={deleteVehicle.isPending}
          className="items-center py-2 active:opacity-70">
          <Text className="font-sans-semibold text-sm text-destructive underline">
            {t('vehicles.edit.delete')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

/** "Edit Vehicle": change a car's make, model, year, plate, VIN and mileage, or delete it. */
export function EditVehicleScreen() {
  const { t } = useTranslation();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const query = useVehicle(vehicleId ?? '');

  return (
    <View className="flex-1 bg-sheet">
      <ScreenHeader title={t('vehicles.edit.title')} className="bg-sheet" />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      ) : (
        <EditVehicleForm vehicle={query.data} />
      )}
    </View>
  );
}
