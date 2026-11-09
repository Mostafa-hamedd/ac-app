import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { AssistanceSheet } from '../components/assistance-sheet';
import { CallNowCard } from '../components/call-now-card';

export function DashboardScreen({ userName }: { userName?: string }) {
  const { t } = useTranslation();
  const firstName = userName?.split(' ')[0];
  const assistanceRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <Screen preset="scroll" edges={[]} contentClassName="gap-4">
        <View className="gap-1">
          <Text variant="h2">
            {firstName ? t('dashboard.greeting', { name: firstName }) : t('dashboard.welcomeBack')}
          </Text>
          <Text variant="muted">{t('dashboard.subtitle')}</Text>
        </View>
        <CallNowCard onPress={() => assistanceRef.current?.present()} />
      </Screen>
      <AssistanceSheet ref={assistanceRef} />
    </>
  );
}
