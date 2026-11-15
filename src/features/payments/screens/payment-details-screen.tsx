import { router, useLocalSearchParams } from 'expo-router';
import { CreditCard } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { formatNumber } from '@/shared/utils/format';
import { colors } from '@/theme';

import { TermsModal } from '../components/terms-modal';
import { processMockPayment } from '../data/payment-gateway.mock';
import { useBookingSummary, type BookingParams } from '@/features/services';
import { formatSlot } from '@/features/services';
import { buildPaymentSummary } from '../utils/payment-summary';

/** "1,100.00" in the app's language. */
function formatMoney(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Step three of booking: the booking summary, the invoice lines and the payment method.
 * Everything arrives as route params from the booking form.
 */
export function PaymentDetailsScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  const row = locale === 'ar' ? 'flex-row-reverse' : 'flex-row';
  const textAlign = locale === 'ar' ? 'text-right' : undefined;
  const params = useLocalSearchParams<BookingParams>();
  const [termsOpen, setTermsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);

  const booking = useBookingSummary(params);
  const { serviceType, cost } = booking;
  const summary = typeof cost === 'number' ? buildPaymentSummary(cost) : null;
  const date = params.date ? new Date(params.date) : null;
  const dateText =
    date && !Number.isNaN(date.getTime())
      ? [
          date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
          params.time ? formatSlot(params.time, locale) : null,
        ]
          .filter(Boolean)
          .join(', ')
      : '—';
  const costText =
    cost === undefined
      ? '—'
      : cost === null
        ? t('services.form.toBeQuoted')
        : t('services.form.cost', { amount: formatNumber(cost) });
  const money = (amount: number) => t('payments.amount', { amount: formatMoney(amount, locale) });

  async function pay() {
    if (!summary || paying) return;
    setPaying(true);
    try {
      const result = await processMockPayment();
      if (result.status === 'success') {
        router.navigate({
          pathname: '/payment-success',
          params: {
            ...params,
            amount: String(summary.total),
            code: result.transactionCode,
            paidAt: new Date().toISOString(),
          },
        });
      } else {
        router.navigate({ pathname: '/payment-failed', params });
      }
    } finally {
      setPaying(false);
    }
  }

  const details = [
    { label: t('payments.service'), value: booking.serviceName },
    {
      label: t('payments.vehicle'),
      value: booking.vehicleText,
    },
    { label: t('services.form.serviceCenter'), value: booking.centerName },
    { label: t('payments.dateTime'), value: dateText },
    { label: t('services.form.estimatedCost'), value: costText },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title={t('payments.title')}
        titleVariant="large"
        bordered
        // Tabs remember the last tab, not the last step, so go back to the form explicitly.
        onBack={() =>
          router.navigate({ pathname: '/book-new-service', params: { type: serviceType } })
        }
      />
      <ScrollView contentContainerClassName="gap-4 p-5" keyboardShouldPersistTaps="handled">
        {/* Booking details, as on the confirmation screen. */}
        <Card className="gap-0 px-5 py-1">
          {details.map((item, index) => (
            <View
              key={item.label}
              className={cn(
                row,
                'items-center justify-between gap-4 py-3',
                index > 0 && 'border-t border-border',
              )}>
              <Text className="font-sans-medium text-xs">{item.label}</Text>
              <Text
                className="flex-1 font-sans text-xs"
                numberOfLines={1}
                style={{ textAlign: locale === 'ar' ? 'left' : 'right' }}>
                {item.value}
              </Text>
            </View>
          ))}
        </Card>

        {/* Invoice */}
        <Card className="gap-0 overflow-hidden p-0">
          <View className="px-5 py-4">
            {summary ? (
              summary.lines.map((line, index) => (
                <View
                  key={line.id}
                  className={cn(
                    row,
                    'items-start justify-between py-2.5',
                    index > 0 && 'border-t border-border',
                  )}>
                  <Text className="font-sans-semibold text-xs">
                    {t(`payments.lines.${line.id}`)}
                  </Text>
                  <Text className="font-sans text-xs">{money(line.amount)}</Text>
                </View>
              ))
            ) : (
              <Text variant="muted" className={cn('py-2.5', textAlign)}>
                {t('payments.quoteNotice')}
              </Text>
            )}
          </View>
          {summary ? (
            <View className="gap-1.5 px-5 py-3">
              <View className={cn(row, 'justify-between')}>
                <Text variant="muted" className="text-2xs">
                  {t('payments.subtotal')}
                </Text>
                <Text variant="muted" className="text-2xs">
                  {money(summary.subtotal)}
                </Text>
              </View>
              <View className={cn(row, 'justify-between')}>
                <Text variant="muted" className="text-2xs">
                  {t('payments.taxesFees')}
                </Text>
                <Text variant="muted" className="text-2xs">
                  {money(summary.taxesAndFees)}
                </Text>
              </View>
            </View>
          ) : null}
          <View
            className={cn(
              row,
              'items-center justify-between border-t border-border px-5 pb-4 pt-3.5',
            )}>
            <Text className="font-sans-semibold text-xs">{t('payments.totalDue')}</Text>
            <Text className="font-sans-semibold text-sm">
              {summary ? money(summary.total) : t('services.form.toBeQuoted')}
            </Text>
          </View>
        </Card>

        {/* Payment method */}
        <Card className={cn(row, 'items-center justify-between')}>
          <View className={cn(row, 'items-center gap-3')}>
            <CreditCard size={20} color={colors.foreground} />
            <Text className="font-sans-medium text-xs">•••• 4242</Text>
          </View>
          <Text className="font-sans-medium text-xs underline">{t('payments.change')}</Text>
        </Card>

        {/* Terms: the box must be ticked to pay; the underlined words open the full text. */}
        <Card className={cn(row, 'items-center gap-3')}>
          <Checkbox
            checked={agreed}
            onCheckedChange={setAgreed}
            accessibilityLabel={`${t('payments.agreePrefix')}${t('payments.terms')}`}
          />
          <Text className={cn('flex-1 font-sans-medium text-xs', textAlign)}>
            {t('payments.agreePrefix')}
            <Text
              accessibilityRole="link"
              onPress={() => setTermsOpen(true)}
              className="font-sans-medium text-xs underline">
              {t('payments.terms')}
            </Text>
          </Text>
        </Card>

        <Button
          className="mt-3"
          disabled={!summary || !agreed}
          loading={paying}
          label={t('payments.payNow')}
          onPress={pay}
        />
      </ScrollView>
      <TermsModal visible={termsOpen} onClose={() => setTermsOpen(false)} />
    </View>
  );
}
