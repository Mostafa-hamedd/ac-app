import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useNotificationResponseRouting, usePushRegistration } from '@/features/notifications';

export default function AppLayout() {
  const { t } = useTranslation();
  useNotificationResponseRouting();
  usePushRegistration();

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="location" options={{ headerShown: false }} />
      <Stack.Screen name="vehicles/[vehicleId]" options={{ title: t('vehicles.title') }} />
      <Stack.Screen name="requests/[requestId]" options={{ title: t('requests.title') }} />
      <Stack.Screen name="payments/index" options={{ title: t('payments.title') }} />
      <Stack.Screen name="payments/[paymentId]" options={{ title: t('payments.detailTitle') }} />
      <Stack.Screen
        name="notifications/[notificationId]"
        options={{ title: t('notifications.title') }}
      />
    </Stack>
  );
}
