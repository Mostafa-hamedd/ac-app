import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card } from '@/shared/ui/card';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Text } from '@/shared/ui/text';
import { formatCurrency, formatDate } from '@/shared/utils/format';

import type { PaymentSummary } from '../types/payment.types';
import { getPaymentStatusDisplay } from '../utils/payment-status';

export function PaymentCard({ payment }: { payment: PaymentSummary }) {
  const { t } = useTranslation();
  const status = getPaymentStatusDisplay(payment.status);
  return (
    <Link href={{ pathname: '/payments/[paymentId]', params: { paymentId: payment.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${payment.title}, ${status.label}`}
        className="active:opacity-80">
        <Card>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text variant="large" numberOfLines={1}>
                {payment.title}
              </Text>
              <Text variant="muted" numberOfLines={1}>
                {payment.vehicleLabel ? `${payment.vehicleLabel} · ` : ''}#{payment.reference}
              </Text>
            </View>
            <StatusBadge label={status.label} tone={status.tone} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text variant="large">{formatCurrency(payment.amountMinor, payment.currency)}</Text>
            <Text variant="muted">
              {payment.dueAt
                ? t('payments.due', { date: formatDate(payment.dueAt) })
                : t('payments.issued', { date: formatDate(payment.issuedAt) })}
            </Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
