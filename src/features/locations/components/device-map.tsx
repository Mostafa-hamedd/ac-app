import { requireOptionalNativeModule } from 'expo-modules-core';
import type * as ExpoMaps from 'expo-maps';
import { LocateFixed } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

import type { Coordinates } from '../utils/distance';
import type { CameraTarget } from '../utils/trip';
import { AndroidDeviceMap } from './device-map-android';

/**
 * `expo-maps` throws as soon as it is imported when this binary has no ExpoMaps
 * module (Expo Go, or a dev client built before the package was added). That
 * throw takes down every route that imports this file, so check first.
 */
function loadMaps(): typeof ExpoMaps | null {
  try {
    if (!requireOptionalNativeModule('ExpoMaps')) return null;
    // Sync on purpose: the map has to be the first paint, and this file must not
    // evaluate expo-maps when the native module is absent.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-maps') as typeof ExpoMaps;
  } catch {
    return null;
  }
}

// iOS only: Android renders OpenStreetMap through MapLibre (device-map-android.tsx).
const maps = Platform.OS === 'ios' ? loadMaps() : null;

const USER_ZOOM = 15;
/** Apple Maps lets us tint markers. */
const ORIGIN_TINT = colors.link;

const CENTER_MARKER_PREFIX = 'center:';
const ORIGIN_MARKER_ID = 'origin';

export type MapCenterMarker = { id: string; coordinates: Coordinates; title: string };
export type MapCameraRequest = { id: number; target: CameraTarget };

export type DeviceMapProps = {
  /** Real device position; null until a fix is available. */
  userCoords: Coordinates | null;
  /** Show the native blue user-location dot (only once permission is granted). */
  showUserLocation: boolean;
  /** Every maintenance center; each becomes a selectable marker. */
  centers: MapCenterMarker[];
  /** Id of the chosen destination center, if any (drawn on top and highlighted). */
  destinationId: string | null;
  /** Marker for a starting point picked on the map; null while the origin is live GPS. */
  originMarker: { coordinates: Coordinates; title: string } | null;
  /** Straight line between origin and destination; null when either is missing. */
  route: Coordinates[] | null;
  /** While true, the next map tap is reported through `onPickPoint`. */
  pickMode: boolean;
  onPickPoint: (coords: Coordinates) => void;
  onSelectCenter: (id: string) => void;
  /** The recenter button was pressed. */
  onRecenter: () => void;
  /** Moves the camera whenever a new request (new id) arrives. */
  cameraRequest: MapCameraRequest | null;
  /** Height of the bottom sheet, so the recenter button and map logo clear it. */
  bottomInset: number;
};

/** Native interactive map: Apple Maps on iOS, OpenStreetMap (MapLibre) on Android. */
export function DeviceMap(props: DeviceMapProps) {
  return Platform.OS === 'android' ? (
    <AndroidDeviceMap {...props} />
  ) : (
    <AppleDeviceMap {...props} />
  );
}

function AppleDeviceMap({
  userCoords,
  showUserLocation,
  centers,
  destinationId,
  originMarker,
  route,
  pickMode,
  onPickPoint,
  onSelectCenter,
  onRecenter,
  cameraRequest,
  bottomInset,
}: DeviceMapProps) {
  const { t } = useTranslation();
  const appleRef = useRef<ExpoMaps.AppleMaps.MapView>(null);
  const hasCentered = useRef(false);

  function moveCamera(target: CameraTarget) {
    void appleRef.current?.setCameraPosition(target);
  }

  // Centre once on the first real fix. Later GPS updates move only the blue dot, so the
  // user can pan and zoom freely.
  useEffect(() => {
    if (userCoords && !hasCentered.current) {
      hasCentered.current = true;
      moveCamera({ coordinates: userCoords, zoom: USER_ZOOM });
    }
  }, [userCoords]);

  // Camera moves requested by the screen (destination chosen, point picked, recenter).
  useEffect(() => {
    if (cameraRequest) moveCamera(cameraRequest.target);
  }, [cameraRequest]);

  const initialCamera = userCoords ? { coordinates: userCoords, zoom: USER_ZOOM } : undefined;

  const centerMarkers = centers.map((center) => ({
    id: `${CENTER_MARKER_PREFIX}${center.id}`,
    coordinates: center.coordinates,
    title: center.title,
    zIndex: center.id === destinationId ? 2 : 1,
    ...(center.id === destinationId ? { tintColor: colors.foreground } : {}),
  }));
  const markers = originMarker
    ? [
        ...centerMarkers,
        {
          id: ORIGIN_MARKER_ID,
          coordinates: originMarker.coordinates,
          title: originMarker.title,
          zIndex: 3,
          tintColor: ORIGIN_TINT,
        },
      ]
    : centerMarkers;

  const polylines = route
    ? [{ id: 'route', coordinates: route, color: colors.foreground, width: 4 }]
    : [];

  const handleMarkerClick = (marker: { id?: string }) => {
    if (marker.id?.startsWith(CENTER_MARKER_PREFIX)) {
      onSelectCenter(marker.id.slice(CENTER_MARKER_PREFIX.length));
    }
  };
  const handleMapClick = (event: { coordinates: Partial<Coordinates> }) => {
    const { latitude, longitude } = event.coordinates;
    if (pickMode && typeof latitude === 'number' && typeof longitude === 'number') {
      onPickPoint({ latitude, longitude });
    }
  };

  if (!maps) {
    return (
      <View
        className="items-center justify-center bg-muted px-8"
        style={[StyleSheet.absoluteFill, { paddingBottom: bottomInset }]}>
        <Text className="text-center">{t('location.mapUnavailable')}</Text>
      </View>
    );
  }

  const AppleMapView = maps.AppleMaps.View;

  return (
    <View style={StyleSheet.absoluteFill}>
      <AppleMapView
        ref={appleRef}
        style={StyleSheet.absoluteFill}
        cameraPosition={initialCamera}
        markers={markers}
        polylines={polylines}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
        properties={{ isMyLocationEnabled: showUserLocation }}
        uiSettings={{ compassEnabled: true, myLocationButtonEnabled: false }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('location.recenter')}
        onPress={() => {
          onRecenter();
          if (userCoords) moveCamera({ coordinates: userCoords, zoom: USER_ZOOM });
        }}
        className="absolute end-4 size-11 items-center justify-center rounded-xs bg-white active:opacity-80"
        style={[styles.shadow, { bottom: bottomInset + 16 }]}>
        <LocateFixed size={20} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
});
