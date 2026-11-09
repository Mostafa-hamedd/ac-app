import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { distanceKm, type Coordinates } from '../utils/distance';
import { formatAddress, type ResolvedAddress } from '../utils/address';

/** Re-resolve the address only after the device has moved this far (km). */
const REGEOCODE_THRESHOLD_KM = 0.1;

type Result = { origin: Coordinates; address: ResolvedAddress | null };

export type ReverseGeocode = {
  address: ResolvedAddress | null;
  /** Coordinates exist but their address is still being resolved. */
  isLoading: boolean;
  /** The geocoder answered with nothing usable, or failed. */
  isUnavailable: boolean;
  retry: () => void;
};

const isNear = (a: Coordinates, b: Coordinates) =>
  (distanceKm(a, b) ?? Infinity) <= REGEOCODE_THRESHOLD_KM;

/** Resolves a human-readable address for real coordinates using the device geocoder (no backend). */
export function useReverseGeocode(coords: Coordinates | null): ReverseGeocode {
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef<Coordinates | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!coords) return;
    if (result && isNear(result.origin, coords)) return;
    if (pending.current && isNear(pending.current, coords)) return;

    const id = ++requestId.current;
    pending.current = coords;
    Location.reverseGeocodeAsync(coords)
      .then((results) => formatAddress(results[0]))
      .catch(() => null)
      .then((address) => {
        if (id !== requestId.current) return;
        pending.current = null;
        setResult({ origin: coords, address });
      });
  }, [coords, result, attempt]);

  // Invalidate any in-flight request on unmount so it can't set state afterwards.
  useEffect(
    () => () => {
      requestId.current++;
    },
    [],
  );

  const retry = useCallback(() => {
    pending.current = null;
    setResult(null);
    setAttempt((n) => n + 1);
  }, []);

  const current = coords && result && isNear(result.origin, coords) ? result : null;
  return {
    address: current?.address ?? null,
    isLoading: !!coords && !current,
    isUnavailable: !!current && current.address === null,
    retry,
  };
}
