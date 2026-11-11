import { TriangleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

/** Home card prompting roadside help; its button opens the Assistance sheet. */
export function CallNowCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="flex-row items-center justify-between gap-3 py-3">
      <View className="flex-1 flex-row items-center gap-3">
        <TriangleAlert size={20} color={colors.foreground} />
        <Text className="flex-1 text-sm">{t('dashboard.callNowTitle')}</Text>
      </View>
      <Button
        size="sm"
        shape="pill"
        className="px-5"
        onPress={onPress}
        label={t('dashboard.callNow')}
      />
    </Card>
  );
}
