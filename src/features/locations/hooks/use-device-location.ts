import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { Coordinates } from '../utils/distance';

export type DeviceLocationStatus =
  | 'loading'
  | 'granted'
  | 'denied' // can ask again
  | 'blocked' // permanently denied: only device Settings can fix it
  | 'services-disabled'
  | 'error';

export type DeviceLocation = {
  status: DeviceLocationStatus;
  coords: Coordinates | null;
  /** Android "Approximate" grant: the position is accurate to a few km only. */
  isApproximate: boolean;
  /** Asks for permission if it is still askable, then locates. */
  request: () => Promise<void>;
  /** Re-checks permission + services without prompting (e.g. after returning from Settings). */
  refresh: () => Promise<void>;
};

/** Real device location via expo-location: permission, services check, one fix, then live updates. */
export function useDeviceLocation(): DeviceLocation {
  const [status, setStatus] = useState<DeviceLocationStatus>('loading');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isApproximate, setIsApproximate] = useState(false);
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const mounted = useRef(true);

  const stopWatching = useCallback(() => {
    subscription.current?.remove();
    subscription.current = null;
  }, []);

  const locate = useCallback(
    async (prompt: boolean) => {
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted && prompt && permission.canAskAgain) {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (!mounted.current) return;

        if (!permission.granted) {
          stopWatching();
          setCoords(null);
          setStatus(permission.canAskAgain ? 'denied' : 'blocked');
          return;
        }
        setIsApproximate(permission.android?.accuracy === 'coarse');

        if (!(await Location.hasServicesEnabledAsync())) {
          stopWatching();
          setCoords(null);
          setStatus('services-disabled');
          return;
        }

        setStatus('loading');
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted.current) return;
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setStatus('granted');

        stopWatching();
        subscription.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 25 },
          (update) =>
            setCoords({ latitude: update.coords.latitude, longitude: update.coords.longitude }),
        );
        if (!mounted.current) stopWatching();
      } catch {
        if (mounted.current) setStatus('error');
      }
    },
    [stopWatching],
  );

  useEffect(() => {
    mounted.current = true;
    // Starts the permission + GPS request; state updates happen after the awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void locate(true);
    // Coming back from Settings: pick up a changed permission or a re-enabled GPS.
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void locate(false);
    });
    return () => {
      mounted.current = false;
      appState.remove();
      stopWatching();
    };
  }, [locate, stopWatching]);

  return {
    status,
    coords,
    isApproximate,
    request: useCallback(() => locate(true), [locate]),
    refresh: useCallback(() => locate(false), [locate]),
  };
}
