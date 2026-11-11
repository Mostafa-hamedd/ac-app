import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, ScrollView, View } from 'react-native';

import { ROADSIDE_HOTLINE } from '@/config/support';
import { SelectedVehicleStrip } from '@/features/vehicles';
import { Button } from '@/shared/ui';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

import { ServiceTypeCard } from '../components/service-type-card';
import { SERVICE_TYPES, type ServiceTypeId } from '../data/service-types';

/** Step one of booking: pick the kind of service for the selected car. */
export function BookServiceScreen() {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState<ServiceTypeId | null>(null);
  const row = i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row';

  async function contactSupport() {
    try {
      await Linking.openURL(`tel:${ROADSIDE_HOTLINE}`);
    } catch {
      Alert.alert(t('assistance.callUnavailable'));
    }
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title={t('services.bookScreenTitle')}
        titleVariant="large"
        onBack={() => router.navigate('/services')}
      />
      <ScrollView contentContainerClassName="gap-5 px-6 pb-4 pt-2">
        <SelectedVehicleStrip />
        <Text className="font-sans-medium text-base text-primary font-bold">{t('services.selectServiceType')}</Text>
        <View className={cn(row, 'flex-wrap gap-3')} accessibilityRole="radiogroup">
          {SERVICE_TYPES.map((type) => (
            <ServiceTypeCard
              key={type.id}
              className="w-[48%] grow"
              icon={type.icon}
              label={t(`services.types.${type.id}`)}
              selected={selected === type.id}
              onPress={() => setSelected(type.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="gap-3 px-6 pb-3 pt-2">
        <Button
          disabled={!selected}
          label={selected ? t('services.continue') : t('services.selectToContinue')}
          onPress={() =>
            selected && router.push({ pathname: '/book-new-service', params: { type: selected } })
          }
        />
        <View className={cn(row, 'items-center justify-center gap-1')}>
          <Text variant="muted" className="text-sm">
            {t('services.cantFind')}
          </Text>
          <Button
            variant="ghost"
            size="auto"
            textClassName="text-sm underline"
            label={t('services.contactSupport')}
            onPress={contactSupport}
          />
        </View>
      </View>
    </View>
  );
}
