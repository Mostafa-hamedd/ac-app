import { router } from 'expo-router';
import { Camera, Check, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, View } from 'react-native';

import { useImagePicker, type PickResult } from '@/shared/hooks/use-image-picker';
import { Button } from '@/shared/ui';
import { OptionRow } from '@/shared/ui/option-row';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { VehiclePhoto } from '../components/vehicle-photo';
import { selectCurrentPhoto, useVehiclePhotoStore } from '../store/vehicle-photo-store';

/**
 * Lets the user take, choose or remove the vehicle photo shown on Home.
 * Changes stay a draft until the check button in the header saves them.
 */
export function UpdatePhotoScreen() {
  const { t } = useTranslation();
  const { pickFromCamera, pickFromGallery, isPicking } = useImagePicker();
  const savedUri = useVehiclePhotoStore(selectCurrentPhoto);
  const setPhoto = useVehiclePhotoStore((state) => state.setPhoto);
  const removePhoto = useVehiclePhotoStore((state) => state.removePhoto);
  const [draftUri, setDraftUri] = useState<string | null>(savedUri);

  // Choosing the photo that is already saved is not a change.
  const hasChanges = draftUri !== savedUri;

  function handleResult(result: PickResult) {
    if (result.status === 'picked') setDraftUri(result.image.uri);
    if (result.status === 'denied') {
      Alert.alert(t('vehicles.photoPermissionTitle'), t('vehicles.photoPermissionMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.openSettings'), onPress: () => void Linking.openSettings() },
      ]);
    }
  }

  function submit() {
    if (draftUri) setPhoto(draftUri);
    else removePhoto();
    router.back();
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title={t('vehicles.updatePhoto')}
        trailing={
          <Button
            variant={hasChanges ? 'default' : 'outline'}
            size="icon"
            shape="pill"
            disabled={!hasChanges}
            testID="save-photo"
            accessibilityLabel={t('vehicles.savePhoto')}
            onPress={submit}
            leftIcon={({ color }) => <Check size={18} color={color} />}
          />
        }
      />
      <Screen preset="scroll" edges={['bottom']} contentClassName="gap-8 px-6 pt-2">
        <VehiclePhoto uri={draftUri} className="aspect-[342/260] w-full" />
        <View className="gap-3">
          <OptionRow
            icon={Camera}
            label={t('vehicles.takePhoto')}
            disabled={isPicking}
            onPress={async () => handleResult(await pickFromCamera())}
          />
          <OptionRow
            icon={ImageIcon}
            label={t('vehicles.chooseFromGallery')}
            disabled={isPicking}
            onPress={async () => handleResult(await pickFromGallery())}
          />
          <OptionRow
            icon={Trash2}
            label={t('vehicles.removePhoto')}
            destructive
            disabled={!draftUri}
            onPress={() => setDraftUri(null)}
          />
        </View>
      </Screen>
    </View>
  );
}
