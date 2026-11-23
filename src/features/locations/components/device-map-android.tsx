import type * as MapLibre from '@maplibre/maplibre-react-native';
import { LocateFixed } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type NativeSyntheticEvent } from 'react-native';

import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

import type { Coordinates } from '../utils/distance';
import type { CameraTarget } from '../utils/trip';
import type { DeviceMapProps } from './device-map';
import { MAP_ATTRIBUTION, MAP_STYLE, MAP_USER_AGENT } from './map-config';

/**
 * MapLibre throws on import when this binary has no MapLibre native module (Expo Go, or a dev
 * client built before the package was added). That would take down every route importing the
 * map, so it is loaded lazily and failures fall back to the "map unavailable" view.
 */
function loadMapLibre(): typeof MapLibre | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const lib = require('@maplibre/maplibre-react-native') as typeof MapLibre;
    // Tile servers (OSM policy) require an identifying User-Agent. Same id = updated, not duplicated.
    lib.TransformRequestManager.addHeader({
      id: 'autoconnect-user-agent',
      name: 'User-Agent',
      value: MAP_USER_AGENT,
    });
    return lib;
  } catch {
    return null;
  }
}

const maplibre = loadMapLibre();

const USER_ZOOM = 15;
const CAMERA_ANIMATION_MS = 400;

const toLngLat = ({ latitude, longitude }: Coordinates): [number, number] => [longitude, latitude];

function Pin({ color, size, label }: { color: string; size: number; label: string }) {
  return (
    <View
      accessibilityLabel={label}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: 3,
        borderColor: colors.card,
      }}
    />
  );
}

/** Android map: OpenStreetMap rendered natively by MapLibre. Same contract as the iOS map. */
export function AndroidDeviceMap({
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
  const cameraRef = useRef<MapLibre.CameraRef>(null);
  const hasCentered = useRef(false);

  function moveCamera(target: CameraTarget, animated: boolean) {
    const options = { center: toLngLat(target.coordinates), zoom: target.zoom };
    if (animated) cameraRef.current?.easeTo({ ...options, duration: CAMERA_ANIMATION_MS });
    else cameraRef.current?.jumpTo(options);
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

  const routeGeoJson = useMemo(
    () =>
      route
        ? ({
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: route.map(toLngLat) },
          } as const)
        : null,
    [route],
  );

  if (!maplibre) {
    return (
      <View
        className="items-center justify-center bg-muted px-8"
        style={[StyleSheet.absoluteFill, { paddingBottom: bottomInset }]}>
        <Text className="text-center">{t('location.mapUnavailable')}</Text>
      </View>
    );
  }

  const { Map, Camera, Marker, UserLocation, GeoJSONSource, Layer } = maplibre;

  const handleMapPress = (event: NativeSyntheticEvent<MapLibre.PressEvent>) => {
    if (!pickMode) return;
    const [longitude, latitude] = event.nativeEvent.lngLat;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      onPickPoint({ latitude, longitude });
    }
  };

  // Destination is drawn last among centers so it sits on top; the origin pin is on top of all.
  const orderedCenters = [...centers].sort(
    (a, b) => Number(a.id === destinationId) - Number(b.id === destinationId),
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        contentInset={{ bottom: bottomInset }}
        // The attribution is drawn by the text overlay below, always visible (OSM policy).
        attribution={false}
        logo={false}
        compass
        onPress={handleMapPress}>
        <Camera
          ref={cameraRef}
          initialViewState={
            userCoords ? { center: toLngLat(userCoords), zoom: USER_ZOOM } : undefined
          }
        />
        {showUserLocation ? <UserLocation /> : null}

        {routeGeoJson ? (
          <GeoJSONSource id="route" data={routeGeoJson}>
            <Layer
              id="route-line"
              type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': colors.foreground, 'line-width': 4 }}
            />
          </GeoJSONSource>
        ) : null}

        {orderedCenters.map((center) => {
          const isDestination = center.id === destinationId;
          return (
            <Marker
              key={center.id}
              id={`center:${center.id}`}
              lngLat={toLngLat(center.coordinates)}
              onPress={() => onSelectCenter(center.id)}>
              <Pin
                color={isDestination ? colors.foreground : colors.destructive}
                size={isDestination ? 30 : 24}
                label={center.title}
              />
            </Marker>
          );
        })}

        {originMarker ? (
          <Marker id="origin" lngLat={toLngLat(originMarker.coordinates)}>
            <Pin color={colors.link} size={26} label={originMarker.title} />
          </Marker>
        ) : null}
      </Map>

      <View
        pointerEvents="none"
        className="absolute start-2 rounded-xs bg-white/80 px-1.5 py-0.5"
        style={{ bottom: bottomInset + 8 }}>
        <Text className="text-xs text-black">{MAP_ATTRIBUTION}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('location.recenter')}
        onPress={() => {
          onRecenter();
          if (userCoords) moveCamera({ coordinates: userCoords, zoom: USER_ZOOM }, true);
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