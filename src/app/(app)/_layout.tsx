import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useNotificationResponseRouting, usePushRegistration } from '@/features/notifications';
import { useResetVehicleSelectionOnExit } from '@/features/vehicles';

export default function AppLayout() {
  const { t } = useTranslation();
  useNotificationResponseRouting();
  usePushRegistration();
  useResetVehicleSelectionOnExit();

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="location" options={{ headerShown: false }} />
      <Stack.Screen name="update-photo" options={{ headerShown: false }} />
      <Stack.Screen name="add-vehicle" options={{ headerShown: false }} />
      <Stack.Screen name="edit-vehicle" options={{ headerShown: false }} />
      <Stack.Screen name="vehicles/[vehicleId]" options={{ title: t('vehicles.title') }} />
      <Stack.Screen name="requests/[requestId]" options={{ title: t('requests.title') }} />
      <Stack.Screen
        name="notifications/[notificationId]"
        options={{ title: t('notifications.title') }}
      />
    </Stack>
  );
}
