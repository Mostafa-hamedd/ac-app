import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, View } from 'react-native';

import { useImagePicker, type PickResult } from '@/shared/hooks/use-image-picker';
import { Button, Input } from '@/shared/ui';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import {
  DropdownField,
  FormField,
  FuelTypeSegment,
  PhotoBox,
} from '../components/vehicle-form-fields';
import { MAKES, MODELS_BY_MAKE, modelYears } from '../data/vehicle-options';
import { useAddVehicle } from '../hooks/use-add-vehicle';
import { useVehiclePhotoStore } from '../store/vehicle-photo-store';
import {
  EMPTY_VEHICLE_FORM,
  isValidVin,
  toNewVehicle,
  type VehicleForm,
} from '../utils/vehicle-form';

/** "Add Vehicle": the car's plate, VIN, make, model, year, fuel type and an optional photo. */
export function AddVehicleScreen() {
  const { t } = useTranslation();
  const { pickFromCamera, pickFromGallery } = useImagePicker();
  const addVehicle = useAddVehicle();
  const selectVehicle = useVehiclePhotoStore((state) => state.selectVehicle);
  const setPhoto = useVehiclePhotoStore((state) => state.setPhoto);

  const [form, setForm] = useState<VehicleForm>(EMPTY_VEHICLE_FORM);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [vinTouched, setVinTouched] = useState(false);

  const update = (changes: Partial<VehicleForm>) =>
    setForm((current) => ({ ...current, ...changes }));
  const newVehicle = toNewVehicle(form);
  const models = form.make ? (MODELS_BY_MAKE[form.make] ?? []) : [];
  const years = modelYears(new Date().getFullYear()).map(String);
  const vinError = vinTouched && !isValidVin(form.vin) ? t('vehicles.add.vinInvalid') : undefined;

  function handlePick(result: PickResult) {
    if (result.status === 'picked') setPhotoUri(result.image.uri);
    if (result.status === 'denied') {
      Alert.alert(t('vehicles.photoPermissionTitle'), t('vehicles.photoPermissionMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.openSettings'), onPress: () => void Linking.openSettings() },
      ]);
    }
  }

  function choosePhoto() {
    Alert.alert(t('vehicles.add.photoPrompt'), undefined, [
      { text: t('vehicles.takePhoto'), onPress: async () => handlePick(await pickFromCamera()) },
      {
        text: t('vehicles.chooseFromGallery'),
        onPress: async () => handlePick(await pickFromGallery()),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }

  async function submit() {
    if (!newVehicle) return;
    try {
      const created = await addVehicle.mutateAsync(newVehicle);
      // Show the new car on My Garage, with the photo if one was added.
      selectVehicle(created.id);
      if (photoUri) setPhoto(photoUri);
      router.back();
    } catch {
      Alert.alert(t('vehicles.add.failed'));
    }
  }

  return (
    <View className="flex-1 bg-sheet">
      <ScreenHeader title={t('vehicles.add.title')} className="bg-sheet" />
      <Screen
        preset="keyboard"
        edges={['bottom']}
        className="bg-sheet"
        contentClassName="gap-5 px-6 pb-8 pt-2">
        <FormField label={t('vehicles.add.licensePlate')}>
          <Input
            variant="outline"
            accessibilityLabel={t('vehicles.add.licensePlate')}
            placeholder={t('vehicles.add.licensePlatePlaceholder')}
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
            placeholder={t('vehicles.add.vinPlaceholder')}
            value={form.vin}
            onChangeText={(vin) => update({ vin })}
            onBlur={() => setVinTouched(true)}
            error={vinError}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={17}
          />
        </FormField>

        <DropdownField
          label={t('vehicles.add.make')}
          placeholder={t('vehicles.add.selectMake')}
          options={MAKES}
          value={form.make}
          // A different make has different models, so the chosen model no longer applies.
          onChange={(make) => update({ make, model: make === form.make ? form.model : null })}
        />

        <DropdownField
          label={t('vehicles.add.model')}
          placeholder={t('vehicles.add.selectModel')}
          options={models}
          value={form.model}
          onChange={(model) => update({ model })}
          disabled={!form.make}
        />

        <DropdownField
          label={t('vehicles.add.year')}
          placeholder={t('vehicles.add.selectYear')}
          options={years}
          value={form.year === null ? null : String(form.year)}
          onChange={(year) => update({ year: Number(year) })}
        />

        <FormField label={t('vehicles.add.fuelType')}>
          <FuelTypeSegment value={form.fuelType} onChange={(fuelType) => update({ fuelType })} />
        </FormField>

        <PhotoBox uri={photoUri} onPress={choosePhoto} />

        <View className="pt-3">
          <Button
            label={t('vehicles.add.submit')}
            disabled={!newVehicle}
            loading={addVehicle.isPending}
            onPress={submit}
          />
        </View>
      </Screen>
    </View>
  );
}
