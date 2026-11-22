import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

const WORDMARK = require('../../../../assets/images/splash-icon.png');
/** The wordmark's width / height, so it keeps its proportions. */
const WORDMARK_RATIO = 430 / 120;
const LOGO_WIDTH = 200;

/** My Garage for someone who isn't logged in: the logo, an invitation, and a way to log in. */
export function GuestGarageState({ onLogin }: { onLogin: () => void }) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-8 px-6">
      <Image
        accessibilityLabel={t('tabs.brand')}
        source={WORDMARK}
        resizeMode="contain"
        style={{
          width: LOGO_WIDTH,
          height: LOGO_WIDTH / WORDMARK_RATIO,
          tintColor: colors.foreground,
        }}
      />
      <View className="items-center gap-1">
        <Text className="text-center font-sans-medium text-lg">{t('myGarage.guestTitle')}</Text>
        <Text className="text-center font-sans-medium text-lg">{t('myGarage.guestMessage')}</Text>
      </View>
      <Button className="self-stretch" onPress={onLogin}>
        {t('myGarage.guestAction')}
      </Button>
    </View>
  );
}
