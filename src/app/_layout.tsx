import '@/global.css';
import '@/mocks/install';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { router, Stack, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useSessionBootstrap, useSessionStatus } from '@/features/auth';
import { restoreLanguage } from '@/lib/i18n';
import { pendingDestination } from '@/lib/linking/pending-destination';
import { configureNotificationHandler } from '@/lib/notifications/notification-registration';
import { AppProviders } from '@/providers/AppProviders';
import { AppSplash } from '@/shared/ui/app-splash';
import { colors } from '@/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();
// AppSplash looks identical, so Android's default exit fade would only overlap the intro.
if (Platform.OS === 'android') SplashScreen.setOptions({ duration: 0 });
configureNotificationHandler();
void restoreLanguage();

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  useSessionBootstrap();
  const status = useSessionStatus();
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  const ready = status !== 'restoring' && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync();
    // Resume a deep link that arrived while signed out (validated again on consume).
    if (status === 'authenticated') {
      const href = pendingDestination.consume();
      if (href) router.push(href as Href);
    }
  }, [ready, status]);

  // Keep the in-app splash up while the session is restored and fonts load.
  if (!ready) return <AppSplash onLayout={() => void SplashScreen.hideAsync()} />;

  // Protected groups improve UX only — the backend still authorizes every request.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === 'authenticated'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'unauthenticated'}>
        {/* The landing intro is the entrance; a native transition would fade it up from white. */}
        <Stack.Screen
          name="(auth)"
          options={{ animation: 'none', contentStyle: { backgroundColor: colors.primary } }}
        />
      </Stack.Protected>
    </Stack>
  );
}
