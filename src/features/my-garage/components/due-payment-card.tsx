import { Calendar, CreditCard } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { formatNumber } from '@/shared/utils/format';
import { colors } from '@/theme';

import type { DuePayment } from '../types/garage.types';

type DuePaymentCardProps = {
  payment: DuePayment;
  onViewInvoice: () => void;
  onPayNow: () => void;
};

/** An invoice waiting to be paid, with the amount and the two ways to deal with it. */
export function DuePaymentCard({ payment, onViewInvoice, onPayNow }: DuePaymentCardProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const lang = isArabic ? 'ar' : 'en';
  const row = isArabic ? 'flex-row-reverse' : 'flex-row';

  return (
    <Card className="gap-3.5 rounded-xs">
      <View className={cn(row, 'items-center justify-between gap-3')}>
        <View className={cn('flex-1 gap-1', isArabic ? 'items-end' : 'items-start')}>
          <View className={cn(row, 'items-center gap-1.5')}>
            <Calendar size={12} color={colors['muted-foreground']} />
            <Text variant="muted" className="text-2xs">
              {t('myGarage.dueBy', { date: payment.dueDate[lang] })}
            </Text>
          </View>
          <Text className="font-sans-semibold text-base">{payment.title[lang]}</Text>
        </View>
        <Text className="font-sans-semibold text-base">
          {t('myGarage.amount', { amount: formatNumber(payment.amount) })}
        </Text>
      </View>

      <View className="h-line bg-border" />

      <View className={cn(row, 'gap-2.5')}>
        <Button
          variant="outline"
          size="auto"
          className="h-9 flex-1 rounded-xs"
          textClassName="text-xs font-sans-semibold"
          label={t('myGarage.viewInvoice')}
          onPress={onViewInvoice}
        />
        <Button
          size="auto"
          className="h-9 flex-1 rounded-xs"
          textClassName="text-xs font-sans-semibold"
          label={t('myGarage.payNow')}
          leftIcon={({ color }) => <CreditCard size={12} color={color} />}
          onPress={onPayNow}
        />
      </View>
    </Card>
  );
}
