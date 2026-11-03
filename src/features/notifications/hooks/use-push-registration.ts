import { useEffect } from 'react';

import { registerForPushNotifications } from '@/lib/notifications/notification-registration';

import { registerPushToken } from '../api/notifications.api';

/**
 * Asks for notification permission once the user is signed in and sends the device's
 * push token to the backend. Mount once inside the signed-in area.
 */
export function usePushRegistration(): void {
  useEffect(() => {
    async function register() {
      const result = await registerForPushNotifications();
      if (result.status !== 'granted') return;
      // A failure here only means no pushes on this device until the next sign-in;
      // it must never interrupt the user.
      await registerPushToken(result.token).catch(() => undefined);
    }
    void register();
  }, []);
}
