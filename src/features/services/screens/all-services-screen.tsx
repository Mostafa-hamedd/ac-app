import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, View } from 'react-native';

import { ROADSIDE_HOTLINE } from '@/config/support';
import { Button } from '@/shared/ui';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { formatNumber } from '@/shared/utils/format';

import { ServiceCard } from '../components/service-card';
import { MOCK_ACTIVE_SERVICES, MOCK_SERVICE_HISTORY } from '../data/mock-services';
import type { Localized } from '../types/service.types';

/** Every service of the vehicle: the ones in progress or booked, and the finished ones. */
export function AllServicesScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const pick = (value: Localized) => value[lang];

  async function callSupport() {
    try {
      await Linking.openURL(`tel:${ROADSIDE_HOTLINE}`);
    } catch {
      Alert.alert(t('assistance.callUnavailable'));
    }
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t('services.title')} bordered titleVariant="large" />
      <Screen preset="scroll" edges={[]} contentClassName="gap-5 p-5">
        <Button
          variant="outline"
          textClassName="text-xs"
          label={t('services.bookNewService')}
          onPress={() => router.push('/book-service')}
        />

        <View className="gap-3">
          <Text className="font-sans-medium text-xs">
            {t('services.activeServices', { count: MOCK_ACTIVE_SERVICES.length })}
          </Text>
          {MOCK_ACTIVE_SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              title={pick(service.title)}
              subtitle={pick(service.center)}
              statusLabel={t(`services.status.${service.status}`)}
              footer={t('services.appointment', { when: pick(service.appointment) })}
              actionLabel={
                service.status === 'ongoing'
                  ? t('services.trackService')
                  : t('services.viewBooking')
              }
            />
          ))}
        </View>

        <View className="gap-3">
          <Text className="font-sans-medium text-xs">{t('services.serviceHistory')}</Text>
          {MOCK_SERVICE_HISTORY.map((service) => (
            <ServiceCard
              key={service.id}
              title={pick(service.title)}
              subtitle={t('services.completedOn', { date: pick(service.completedOn) })}
              statusLabel={t(`services.status.${service.status}`)}
              footer={t('services.paid', {
                currency: service.currency,
                amount: formatNumber(service.amount),
              })}
              actionLabel={t('services.viewDetails')}
              actionVariant="outline"
            />
          ))}
        </View>

        <Button
          variant="ghost"
          size="auto"
          className="pt-3"
          textClassName="text-xs underline"
          label={t('services.needHelp')}
          onPress={callSupport}
        />
      </Screen>
    </View>
  );
}
