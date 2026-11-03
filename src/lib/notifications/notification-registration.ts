import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

export type PushRegistrationResult =
  | { status: 'granted'; token: string }
  | { status: 'denied' | 'unsupported' | 'error'; reason: string };

/** How notifications show while the app is open. Push payloads must not carry personal data: they appear on the lock screen. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Asks for permission and returns an Expo push token. Call it at a meaningful
 * moment in the UX (not on first launch), then send the token to the backend
 * through the authenticated API. Requires a development build on a physical device.
 */
export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  if (!Device.isDevice) {
    return { status: 'unsupported', reason: 'Push notifications need a physical device.' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    return { status: 'denied', reason: 'Notification permission was not granted.' };
  }

  const projectId: string | undefined =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    return { status: 'error', reason: 'Missing EAS projectId. Run `eas init` first.' };
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { status: 'granted', token: data };
  } catch {
    return { status: 'error', reason: 'Could not get a push token.' };
  }
}
