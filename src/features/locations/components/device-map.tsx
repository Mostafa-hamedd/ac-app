import { AppleMaps, GoogleMaps } from 'expo-maps';
import { LocateFixed } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import type { Coordinates } from '../utils/distance';
import type { CameraTarget } from '../utils/trip';

const USER_ZOOM = 15;
/** Apple Maps lets us tint markers; Google's default pins can't be recoloured here. */
const ORIGIN_TINT = colors.link;

const CENTER_MARKER_PREFIX = 'center:';
const ORIGIN_MARKER_ID = 'origin';

export type MapCenterMarker = { id: string; coordinates: Coordinates; title: string };
export type MapCameraRequest = { id: number; target: CameraTarget };

type DeviceMapProps = {
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

/** Native interactive map: Apple Maps on iOS, Google Maps on Android. */
export function DeviceMap({
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
  const appleRef = useRef<AppleMaps.MapView>(null);
  const googleRef = useRef<GoogleMaps.MapView>(null);
  const hasCentered = useRef(false);

  function moveCamera(target: CameraTarget, animated: boolean) {
    if (Platform.OS === 'ios') void appleRef.current?.setCameraPosition(target);
    else void googleRef.current?.setCameraPosition({ ...target, duration: animated ? 400 : 0 });
  }

  // Centre once on the first real fix. Later GPS updates move only the blue dot, so the
  // user can pan and zoom freely.
  useEffect(() => {
    if (userCoords && !hasCentered.current) {
      hasCentered.current = true;
      moveCamera({ coordinates: userCoords, zoom: USER_ZOOM }, false);
    }
  }, [userCoords]);

  // Camera moves requested by the screen (destination chosen, point picked, recenter).
  useEffect(() => {
    if (cameraRequest) moveCamera(cameraRequest.target, true);
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

  return (
    <View style={StyleSheet.absoluteFill}>
      {Platform.OS === 'ios' ? (
        <AppleMaps.View
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
      ) : (
        <GoogleMaps.View
          ref={googleRef}
          style={StyleSheet.absoluteFill}
          cameraPosition={initialCamera}
          markers={markers}
          polylines={polylines}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          properties={{ isMyLocationEnabled: showUserLocation }}
          uiSettings={{
            compassEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          }}
          contentPadding={{ bottom: bottomInset }}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('location.recenter')}
        onPress={() => {
          onRecenter();
          if (userCoords) moveCamera({ coordinates: userCoords, zoom: USER_ZOOM }, true);
        }}
        className="absolute end-4 size-11 items-center justify-center rounded-full bg-white active:opacity-80"
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
