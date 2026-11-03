import { WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useNetworkStatus } from '@/shared/hooks/use-network-status';
import { colors } from '@/theme';

import { Text } from './text';

/** Thin banner shown while the device is offline. Cached data stays visible. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const { isOffline } = useNetworkStatus();
  if (!isOffline) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="flex-row items-center justify-center gap-2 bg-warning px-4 py-2">
      <WifiOff size={16} color={colors['warning-foreground']} />
      <Text variant="small" className="text-warning-foreground">
        {t('common.offline')}
      </Text>
    </View>
  );
}
