import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Navigation, Phone, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, View } from 'react-native';

import { ROADSIDE_HOTLINE } from '@/config/support';
import { useTextAlign } from '@/shared/hooks/use-text-align';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

import { useShareLocation } from '../hooks/use-share-location';

export type AssistanceSheetProps = { ref?: React.Ref<BottomSheetModal> };

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
}

/** "Need roadside assistance?" sheet: share the current location or call the hotline. */
export function AssistanceSheet({ ref }: AssistanceSheetProps) {
  const { t } = useTranslation();
  const textAlign = useTextAlign();
  const { isLocating, requestLocation } = useShareLocation();

  function close() {
    if (ref && typeof ref === 'object') ref.current?.dismiss();
  }

  function offerSettings(message: string) {
    Alert.alert(t('assistance.locationTitle'), message, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.openSettings'), onPress: () => void Linking.openSettings() },
    ]);
  }

  async function handleShareLocation() {
    const result = await requestLocation();
    switch (result.status) {
      case 'granted':
        close();
        router.push('/location');
        break;
      case 'denied':
        if (result.canAskAgain) {
          Alert.alert(t('assistance.locationTitle'), t('assistance.locationDenied'));
        } else {
          offerSettings(t('assistance.locationBlocked'));
        }
        break;
      case 'services-disabled':
        offerSettings(t('assistance.locationServicesOff'));
        break;
      default:
        Alert.alert(t('assistance.locationTitle'), t('assistance.locationError'));
    }
  }

  async function handleCall() {
    try {
      await Linking.openURL(`tel:${ROADSIDE_HOTLINE}`);
    } catch {
      Alert.alert(t('assistance.callUnavailable'));
    }
  }

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={Backdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleComponent={null}>
      <BottomSheetView className="gap-4 px-4 pb-8 pt-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={close}
          className="size-9 items-center justify-center self-end rounded-full border border-border active:opacity-80">
          <X size={16} color={colors.foreground} />
        </Pressable>

        <Text accessibilityRole="header" className={`text-lg ${textAlign}`}>
          {t('assistance.title')}
        </Text>
        <View className="h-px bg-border" />

        <View className="gap-3">
          <Button loading={isLocating} onPress={handleShareLocation}>
            <Navigation size={14} color={colors['primary-foreground']} />
            <Text>{t('assistance.shareLocation')}</Text>
          </Button>
          <Button variant="outline" onPress={handleCall}>
            <Phone size={14} color={colors.foreground} />
            <Text className="font-sans">{t('assistance.callHotline')}</Text>
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
