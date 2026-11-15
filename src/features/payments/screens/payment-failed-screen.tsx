import { router, useLocalSearchParams } from 'expo-router';
import { TriangleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Button } from '@/shared/ui';
import { Text } from '@/shared/ui/text';

import { PaymentResultHeader } from '../components/payment-result';
import type { BookingParams } from '@/features/services';
import { useContactSupport } from '@/shared/hooks/use-contact-support';

/** Step four of booking, when the payment did not go through. */
export function PaymentFailedScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<BookingParams>();
  const contactSupport = useContactSupport();

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="grow justify-center items-center gap-6 p-6">
        <PaymentResultHeader icon={TriangleAlert} title={t('payments.result.failedTitle')} />
        <Text
          className="w-full font-sans-medium text-xs"
          style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
          {t('payments.result.failedMessage')}
        </Text>

        <View className="w-full gap-3 pt-5">
          <Button
            label={t('payments.result.tryAgain')}
            // Back to the payment screen with the same booking.
            onPress={() => router.navigate({ pathname: '/payment-details', params })}
          />
          <Button variant="outline" label={t('services.contactSupport')} onPress={contactSupport} />
        </View>
      </ScrollView>
    </View>
  );
}
