import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export function DashboardScreen({ userName }: { userName?: string }) {
  const { t } = useTranslation();
  const firstName = userName?.split(' ')[0];

  return (
    <Screen preset="scroll" edges={[]} contentClassName="gap-4">
      <View className="gap-1">
        <Text variant="h2">
          {firstName ? t('dashboard.greeting', { name: firstName }) : t('dashboard.welcomeBack')}
        </Text>
        <Text variant="muted">{t('dashboard.subtitle')}</Text>
      </View>
      
    </Screen>
  );
}
