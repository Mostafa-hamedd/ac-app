import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, CardTitle } from '@/shared/ui/card';
import { QueryView } from '@/shared/ui/query-view';
import { Screen } from '@/shared/ui/screen';
import { StatusBadge } from '@/shared/ui/status-badge';
import { Text } from '@/shared/ui/text';
import { formatCurrency, formatDate } from '@/shared/utils/format';

import { usePayment } from '../hooks/use-payments';
import { getPaymentStatusDisplay } from '../utils/payment-status';

export function PaymentDetailScreen({ paymentId }: { paymentId: string }) {
  const { t } = useTranslation();
  const query = usePayment(paymentId);

  return (
    <QueryView query={query}>
      {(payment) => {
        const status = getPaymentStatusDisplay(payment.status);
        return (
          <Screen preset="scroll" contentClassName="gap-4">
            <Stack.Screen options={{ title: `#${payment.reference}` }} />
            <View className="gap-2">
              <Text variant="h2">{payment.title}</Text>
              <StatusBadge label={status.label} tone={status.tone} />
            </View>

            <Card>
              <CardTitle>{formatCurrency(payment.amountMinor, payment.currency)}</CardTitle>
              {payment.vehicleLabel ? <Text variant="muted">{payment.vehicleLabel}</Text> : null}
              <Text variant="muted">{payment.dealershipName}</Text>
              <Text variant="muted">
                {t('payments.issued', { date: formatDate(payment.issuedAt) })}
              </Text>
              {payment.dueAt ? (
                <Text variant="muted">
                  {t('payments.due', { date: formatDate(payment.dueAt) })}
                </Text>
              ) : null}
              {payment.paidAt ? (
                <Text variant="muted">
                  {t('payments.paid', { date: formatDate(payment.paidAt) })}
                </Text>
              ) : null}
              {payment.description ? <Text>{payment.description}</Text> : null}
            </Card>
          </Screen>
        );
      }}
    </QueryView>
  );
}
