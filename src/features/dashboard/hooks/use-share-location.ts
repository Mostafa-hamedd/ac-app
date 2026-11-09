import * as Location from 'expo-location';
import { useState } from 'react';

export type ShareLocationResult =
  | { status: 'granted'; coords: { latitude: number; longitude: number } }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'services-disabled' }
  | { status: 'error' };

/** Asks for foreground location permission and reads the current position. */
export function useShareLocation() {
  const [isLocating, setIsLocating] = useState(false);

  async function requestLocation(): Promise<ShareLocationResult> {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        return { status: 'denied', canAskAgain: permission.canAskAgain };
      }
      if (!(await Location.hasServicesEnabledAsync())) return { status: 'services-disabled' };
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        status: 'granted',
        coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
      };
    } catch {
      return { status: 'error' };
    } finally {
      setIsLocating(false);
    }
  }

  return { isLocating, requestLocation };
}
