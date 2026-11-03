import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/theme';

import { Text } from './text';

export function LoadingState({ message }: { message?: string }) {
  const { t } = useTranslation();
  const label = message ?? t('common.loading');
  return (
    <View
      className="flex-1 items-center justify-center gap-3 p-6"
      accessibilityRole="progressbar"
      accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} />
      <Text variant="muted">{label}</Text>
    </View>
  );
}
