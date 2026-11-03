import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, View } from 'react-native';

import { useImagePicker, type PickedImage } from '@/shared/hooks/use-image-picker';
import { useTextAlign } from '@/shared/hooks/use-text-align';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

export type DocumentUploadSheetProps = {
  ref?: React.Ref<BottomSheetModal>;
  label: string;
  onPicked: (image: PickedImage) => void;
};

/** Lets the user scan a document with the camera or pick a photo of it from the gallery. */
export function DocumentUploadSheet({ label, onPicked, ref }: DocumentUploadSheetProps) {
  const { t } = useTranslation();
  const textAlign = useTextAlign();
  const descriptionLabel = label.toLowerCase();
  const { pickFromCamera, pickFromGallery, isPicking } = useImagePicker();

  async function handlePick(source: 'camera' | 'gallery') {
    const result = source === 'camera' ? await pickFromCamera() : await pickFromGallery();
    if (result.status === 'picked') onPicked(result.image);
    if (result.status === 'denied') {
      Alert.alert(t('uploadDocuments.permissionTitle'), t('uploadDocuments.permissionMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.openSettings'), onPress: () => void Linking.openSettings() },
      ]);
    }
  }

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors['muted-foreground'] }}>
      <BottomSheetView className="gap-5 px-4 pb-8 pt-2">
        <Text variant="h3" className={textAlign}>
          {t('uploadDocuments.sheetTitle', { label })}
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={isPicking}
          onPress={() => handlePick('camera')}
          className="flex-row items-center justify-between gap-4 rounded-md border border-input p-4 active:opacity-80">
          <View className="flex-1 gap-2.5">
            <View className="flex-row items-center gap-2">
              <Camera size={16} color={colors.foreground} />
              <Text className="font-sans-medium">{t('uploadDocuments.scanTitle')}</Text>
            </View>
            <Text variant="muted" className={cn('text-xs', textAlign)}>
              {t('uploadDocuments.scanDescription', { label: descriptionLabel })}
            </Text>
          </View>
          <View className="rounded-sm bg-muted px-2.5 py-2">
            <Text className="font-sans-medium text-2xs">{t('uploadDocuments.recommended')}</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isPicking}
          onPress={() => handlePick('gallery')}
          className="flex-row items-center gap-3 rounded-md border border-input p-4 active:opacity-80">
          <ImageIcon size={16} color={colors.foreground} />
          <View className="flex-1 gap-2.5">
            <Text className={cn('font-sans-medium', textAlign)}>
              {t('uploadDocuments.galleryTitle')}
            </Text>
            <Text variant="muted" className={cn('text-xs', textAlign)}>
              {t('uploadDocuments.galleryDescription', { label: descriptionLabel })}
            </Text>
          </View>
        </Pressable>

        <View className="rounded-lg bg-muted p-3.5">
          <Text variant="muted" className={cn('text-2xs', textAlign)}>
            {t('uploadDocuments.passportNote')}
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
