import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheckBig } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

import { PaymentResultHeader } from '../components/payment-result';
import { useBookingSummary, type BookingParams } from '@/features/services';

/** Step four of booking: the payment went through. */
export function PaymentSuccessScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  const row = locale === 'ar' ? 'flex-row-reverse' : 'flex-row';
  const params = useLocalSearchParams<
    BookingParams & { amount?: string; code?: string; paidAt?: string }
  >();
  const booking = useBookingSummary(params);

  const paidAt = params.paidAt ? new Date(params.paidAt) : new Date();
  const amount = Number(params.amount);
  const rows = [
    {
      label: t('payments.result.amount'),
      value: Number.isFinite(amount)
        ? t('payments.amount', {
            amount: new Intl.NumberFormat(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(amount),
          })
        : '—',
    },
    {
      label: t('payments.result.date'),
      value: Number.isNaN(paidAt.getTime())
        ? '—'
        : paidAt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    {
      label: t('payments.result.transactionCode'),
      value: params.code ? `#${params.code}` : '—',
    },
    { label: t('payments.vehicle'), value: booking.vehicleText },
    { label: t('payments.result.serviceType'), value: booking.serviceName },
    { label: t('services.form.serviceCenter'), value: booking.centerName },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="grow justify-center gap-6 p-6">
        <PaymentResultHeader icon={CircleCheckBig} title={t('payments.result.successTitle')} />

        <Card className="gap-3.5 p-5">
          {rows.map((item) => (
            <View key={item.label} className={cn(row, 'items-start justify-between gap-4')}>
              <Text className="font-sans-medium text-xs">{item.label}</Text>
              <Text
                className="flex-1 font-sans-medium text-xs"
                style={{ textAlign: locale === 'ar' ? 'left' : 'right' }}>
                {item.value}
              </Text>
            </View>
          ))}
        </Card>

        <View className="gap-3 pt-5">
          <Button
            label={t('payments.result.viewBooking')}
            onPress={() => router.navigate('/services')}
          />
          <Button
            variant="outline"
            label={t('payments.result.backToGarage')}
            onPress={() => router.navigate('/')}
          />
        </View>
      </ScrollView>
    </View>
  );
}
