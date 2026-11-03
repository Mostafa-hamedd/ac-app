import { useNetInfo } from '@react-native-community/netinfo';

/**
 * `isInternetReachable` is null while unknown — treat unknown as online to avoid
 * flashing the offline banner on startup.
 */
export function useNetworkStatus() {
  const { isConnected, isInternetReachable } = useNetInfo();
  const isOffline = isConnected === false || isInternetReachable === false;
  return { isOffline };
}
