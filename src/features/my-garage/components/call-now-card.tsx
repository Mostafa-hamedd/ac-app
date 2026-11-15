import { TriangleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';
import { cn } from '@/shared/utils/cn';

/** Home card prompting roadside help; its button opens the Assistance sheet. */
export function CallNowCard({ onPress }: { onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <Card
      className={cn(
        'w-full flex-row items-center justify-between py-3',
        isArabic && 'flex-row-reverse',
      )}>
      <View className={cn('shrink flex-row items-center gap-3', isArabic && 'flex-row-reverse')}>
        <TriangleAlert size={20} color={colors.foreground} />
        <Text className={cn('shrink text-sm', isArabic && 'text-right')} numberOfLines={1}>
          {t('myGarage.callNowTitle')}
        </Text>
      </View>
      <Button
        size="sm"
        shape="pill"
        className="px-5"
        onPress={onPress}
        label={t('myGarage.callNow')}
      />
    </Card>
  );
}
