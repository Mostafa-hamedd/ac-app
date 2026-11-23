import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { CircleAlert, ImageUp, Scan, X } from 'lucide-react-native';
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

// From the Upload Doc design (390 wide): top corners 30, content inset 26, close button 36
// at 16 from the top and side edges, title 72 from the top.
const SHEET_RADIUS = 30;
/** The sheet is 490 tall in the design (home indicator area included). */
const SHEET_HEIGHT = 490;
const CONTENT_INSET = 26;
const CLOSE_SIZE = 36;
const CLOSE_OFFSET = 16;
const TITLE_TOP = 72;
/** The passport note is 12 wider than the content on each side. */
const NOTE_BLEED = 12;
/** Passport note: icon 21 from the start, text 13 after the icon. */
const NOTE_PADDING_TOP = 11;
const NOTE_PADDING_BOTTOM = 11;
const NOTE_MARGIN_TOP = 9;
const NOTE_MARGIN_BOTTOM = 36;
const NOTE_ICON_INSET = 21;
const NOTE_END_INSET = 20;
const NOTE_GAP = 13;
/** Recommended chip: radius 7, 11 x 8 padding, 15 from the top and end edges of the card. */
const CHIP_RADIUS = 7;
const CHIP_INSET = 15;

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.9} />;
}

/** Lets the user scan a document with the camera or pick a photo of it from the gallery. */
export function DocumentUploadSheet({ label, onPicked, ref }: DocumentUploadSheetProps) {
  const { t, i18n } = useTranslation();
  const textAlign = useTextAlign();
  const isArabic = i18n.language === 'ar';
  const descriptionLabel = label.toLowerCase();
  const { pickFromCamera, pickFromGallery, isPicking } = useImagePicker({ allowsEditing: true });

  function close() {
    if (ref && typeof ref === 'object') ref.current?.dismiss();
  }

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
      backdropComponent={Backdrop}
      backgroundStyle={{
        backgroundColor: colors.sheet,
        borderTopLeftRadius: SHEET_RADIUS,
        borderTopRightRadius: SHEET_RADIUS,
      }}
      handleComponent={null}>
      <BottomSheetView
        className="pb-10"
        style={{
          minHeight: SHEET_HEIGHT,
          paddingTop: TITLE_TOP,
          paddingHorizontal: CONTENT_INSET,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={close}
          hitSlop={8}
          className="items-center justify-center rounded-full border border-input/20 active:opacity-70"
          style={{
            position: 'absolute',
            top: CLOSE_OFFSET,
            [isArabic ? 'left' : 'right']: CLOSE_OFFSET,
            width: CLOSE_SIZE,
            height: CLOSE_SIZE,
            borderWidth: 1,
          }}>
          <X size={16} color={colors.foreground} />
        </Pressable>

        <Text
          accessibilityRole="header"
          className={cn('font-sans-semibold text-xl', textAlign)}
          style={{ letterSpacing: -0.4 }}>
          {t('uploadDocuments.sheetTitle', { label })}
        </Text>

        <View
          className="mt-2.5 flex-row items-start rounded-lg bg-muted-strong"
          style={{
            marginHorizontal: -NOTE_BLEED,
            paddingTop: NOTE_PADDING_TOP,
            paddingBottom: NOTE_PADDING_BOTTOM,
            marginTop: NOTE_MARGIN_TOP,
            marginBottom: NOTE_MARGIN_BOTTOM,
            paddingStart: NOTE_ICON_INSET,
            paddingEnd: NOTE_END_INSET,
            gap: NOTE_GAP,
            backgroundColor: colors['muted-strong'],
          }}>
          <CircleAlert size={18} color={colors.foreground} />
          <Text className={cn('flex-1 text-caption', textAlign)}>
            {t('uploadDocuments.passportNote')}
          </Text>
        </View>

        <View className="mt-9 gap-5">
          <Pressable
            accessibilityRole="button"
            disabled={isPicking}
            onPress={() => handlePick('camera')}
            className="flex-row items-start rounded-md border-dashed border-input/20 px-5 py-4 active:opacity-80"
            style={{ borderWidth: 1 }}>
            <View className="flex-1 gap-2.5">
              <View className="flex-row items-center gap-2">
                <Scan size={14} color={colors.foreground} />
                <Text className="font-sans-medium text-base">{t('uploadDocuments.scanTitle')}</Text>
              </View>
              <Text variant="muted" className={cn('text-sm', textAlign)} style={{ width: '60%' }}>
                {t('uploadDocuments.scanDescription', { label: descriptionLabel })}
              </Text>
            </View>
            <View
              className="bg-muted-strong"
              style={{
                position: 'absolute',
                top: CHIP_INSET,
                [isArabic ? 'left' : 'right']: CHIP_INSET,
                borderRadius: CHIP_RADIUS,
                paddingHorizontal: 11,
                paddingVertical: 8,
                backgroundColor: colors['muted-strong'],
              }}>
              <Text className="font-sans-medium text-2xs">{t('uploadDocuments.recommended')}</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isPicking}
            onPress={() => handlePick('gallery')}
            className="gap-2.5 rounded-md border-dashed border-input/20 px-5 py-4 active:opacity-80"
            style={{ borderWidth: 1 }}>
            <View className="flex-row items-center gap-2">
              <ImageUp size={14} color={colors.foreground} />
              <Text className="font-sans-medium text-base">
                {t('uploadDocuments.galleryTitle')}
              </Text>
            </View>
            <Text variant="muted" className={cn('text-sm', textAlign)} style={{ width: '60%' }}>
              {t('uploadDocuments.galleryDescription', { label: descriptionLabel })}
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
