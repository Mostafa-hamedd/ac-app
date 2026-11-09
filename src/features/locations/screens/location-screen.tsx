import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { ChevronLeft, ExternalLink, Map, Phone } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  type LayoutChangeEvent,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTextAlign } from '@/shared/hooks/use-text-align';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

import { DeviceMap, type MapCameraRequest, type MapCenterMarker } from '../components/device-map';
import { LocationNotice } from '../components/location-notice';
import { TripInputs, type Suggestion } from '../components/trip-inputs';
import { MAINTENANCE_CENTERS } from '../data/maintenance-centers';
import { useDeviceLocation } from '../hooks/use-device-location';
import { useReverseGeocode } from '../hooks/use-reverse-geocode';
import type { Coordinates } from '../utils/distance';
import { distanceKm } from '../utils/distance';
import {
  buildLocationDetails,
  buildMapsUrl,
  fitCamera,
  getCopyText,
  pick,
  resolveOriginCoords,
  routeLine,
  searchCenters,
  type CameraTarget,
  type Lang,
  type Origin,
} from '../utils/trip';

const USER_ZOOM = 15;

/**
 * Maintenance-center map. The trip (origin + destination) is the single source of truth:
 * the inputs, markers, route, camera, details sheet, Copy Address and Open in Maps all read it.
 */
export function LocationScreen() {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'ar' ? 'ar' : 'en';
  const textAlign = useTextAlign();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const location = useDeviceLocation();

  const [origin, setOrigin] = useState<Origin>({ type: 'gps' });
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pickMode, setPickMode] = useState(false);
  const [cameraRequest, setCameraRequest] = useState<MapCameraRequest | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const cameraId = useRef(0);

  const originCoords = resolveOriginCoords(origin, location.coords);
  const isCustomOrigin = origin.type === 'custom';
  const geocode = useReverseGeocode(originCoords);
  const destination = MAINTENANCE_CENTERS.find((c) => c.id === destinationId) ?? null;

  const details = buildLocationDetails({
    originCoords,
    originIsCustom: isCustomOrigin,
    originAddress: geocode.address,
    destination,
    lang,
    myLocationLabel: t('location.myLocation'),
    selectedPointLabel: t('location.selectedPoint'),
  });
  const route = routeLine(originCoords, destination);

  // Status line while the origin's address is not known (GPS pending, no GPS, geocoding).
  const originFallback =
    !isCustomOrigin && location.status === 'loading'
      ? t('location.finding')
      : !originCoords
        ? t('location.noLocation')
        : geocode.isLoading
          ? t('location.findingAddress')
          : t('location.addressUnavailable');
  const originAddress = geocode.address?.full ?? originFallback;
  const sheetAddress = details.kind === 'center' ? details.fullAddress : originAddress;
  const sheetSubtitle = details.kind === 'center' ? details.shortAddress : null;

  const centerMarkers: MapCenterMarker[] = MAINTENANCE_CENTERS.map((center) => ({
    id: center.id,
    coordinates: center.coordinates,
    title: pick(center.name, lang),
  }));
  const suggestions: Suggestion[] = searchCenters(query, MAINTENANCE_CENTERS, originCoords).map(
    (center) => {
      const km = distanceKm(originCoords, center.coordinates);
      const area = pick(center.area, lang);
      return {
        id: center.id,
        name: pick(center.name, lang),
        subtitle:
          km === null ? area : `${area} · ${t('location.distanceKm', { distance: km.toFixed(1) })}`,
      };
    },
  );

  function moveCamera(target: CameraTarget) {
    cameraId.current += 1;
    setCameraRequest({ id: cameraId.current, target });
  }

  function selectCenter(id: string) {
    const center = MAINTENANCE_CENTERS.find((c) => c.id === id);
    if (!center) return;
    setDestinationId(id);
    setQuery(pick(center.name, lang));
    setPickMode(false);
    moveCamera(fitCamera(originCoords, center.coordinates));
  }

  function changeQuery(text: string) {
    setQuery(text);
    // Editing the text starts a new search, so the previous destination no longer applies.
    if (destinationId) setDestinationId(null);
  }

  function clearDestination() {
    setQuery('');
    setDestinationId(null);
  }

  function pickPoint(coords: Coordinates) {
    setOrigin({ type: 'custom', coords });
    setPickMode(false);
    moveCamera(
      destination
        ? fitCamera(coords, destination.coordinates)
        : { coordinates: coords, zoom: USER_ZOOM },
    );
  }

  function useMyLocation() {
    setOrigin({ type: 'gps' });
    setPickMode(false);
    if (location.coords) moveCamera({ coordinates: location.coords, zoom: USER_ZOOM });
  }

  async function openInMaps() {
    const url = buildMapsUrl(originCoords, destination, details.fullAddress);
    if (!url) {
      Alert.alert(t('location.mapsUnavailable'));
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('location.mapsUnavailable'));
    }
  }

  async function copyAddress() {
    const text = getCopyText(details);
    if (!text) {
      Alert.alert(t('location.copyUnavailable'));
      return;
    }
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert(t('location.addressCopied'));
    } catch {
      Alert.alert(t('location.copyFailed'));
    }
  }

  async function callCenter() {
    if (!details.phone) return;
    try {
      await Linking.openURL(`tel:${details.phone.replace(/\s/g, '')}`);
    } catch {
      Alert.alert(t('location.callFailed'));
    }
  }

  function onSheetLayout(event: LayoutChangeEvent) {
    setSheetHeight(event.nativeEvent.layout.height);
  }

  return (
    <View className="flex-1 bg-muted">
      <DeviceMap
        userCoords={location.coords}
        showUserLocation={location.status === 'granted'}
        centers={centerMarkers}
        destinationId={destinationId}
        originMarker={
          origin.type === 'custom'
            ? { coordinates: origin.coords, title: t('location.selectedPoint') }
            : null
        }
        route={route}
        pickMode={pickMode}
        onPickPoint={pickPoint}
        onSelectCenter={selectCenter}
        onRecenter={() => setOrigin({ type: 'gps' })}
        cameraRequest={cameraRequest}
        bottomInset={sheetHeight}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('fields.goBack')}
        onPress={() => router.back()}
        className="absolute left-4 size-10 items-center justify-center rounded-full bg-white active:opacity-80"
        style={{ top: insets.top + 9, ...styles.backShadow }}>
        <ChevronLeft size={20} color={colors.foreground} />
      </Pressable>

      <View className="absolute inset-x-4" style={{ top: insets.top + 57, ...styles.cardShadow }}>
        <TripInputs
          fromTitle={isCustomOrigin ? t('location.selectedPoint') : t('location.myLocation')}
          fromAddress={originAddress}
          isCustomOrigin={isCustomOrigin}
          pickMode={pickMode}
          onTogglePick={() => setPickMode((on) => !on)}
          onUseMyLocation={useMyLocation}
          query={query}
          onQueryChange={changeQuery}
          hasDestination={!!destination}
          suggestions={suggestions}
          onSelectSuggestion={selectCenter}
          onClear={clearDestination}
        />
      </View>

      <View
        onLayout={onSheetLayout}
        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-background px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}>
        <View className="mb-4 h-1 w-10 self-center rounded-sm bg-border" />
        <ScrollView style={{ maxHeight: windowHeight * 0.45 }} contentContainerClassName="gap-5">
          <View className="gap-2">
            <Text className={`font-sans-semibold text-xl ${textAlign}`}>{details.title}</Text>
            {sheetSubtitle ? (
              <Text variant="muted" className={`text-sm ${textAlign}`}>
                {sheetSubtitle}
              </Text>
            ) : null}
            <Text variant="muted" className={`text-base ${textAlign}`}>
              {sheetAddress}
            </Text>
            {details.hours ? <Text className={`text-sm ${textAlign}`}>{details.hours}</Text> : null}
            {details.phone ? <Text className={`text-sm ${textAlign}`}>{details.phone}</Text> : null}
            {details.distanceKm !== null ? (
              <Text className={`font-sans-semibold text-sm ${textAlign}`}>
                {t('location.distanceStraight', { distance: details.distanceKm.toFixed(1) })}
              </Text>
            ) : null}
            {route ? (
              <Text variant="muted" className={textAlign}>
                {t('location.routeApproximate')}
              </Text>
            ) : null}
            {details.kind === 'origin' && geocode.isUnavailable ? (
              <Pressable accessibilityRole="button" onPress={geocode.retry} className="self-start">
                <Text className="font-sans-medium text-sm">{t('common.tryAgain')}</Text>
              </Pressable>
            ) : null}
          </View>

          <LocationNotice
            status={location.status}
            isApproximate={location.isApproximate}
            onRequest={location.request}
            onRetry={location.request}
          />

          {details.phone ? (
            <Button
              variant="outline"
              onPress={callCenter}
              label={t('location.call')}
              leftIcon={({ color }) => <Phone size={16} color={color} />}
            />
          ) : null}

          <Button
            onPress={openInMaps}
            label={t('location.openInMaps')}
            textClassName="text-base"
            leftIcon={({ color }) => <Map size={18} color={color} />}
            rightIcon={({ color }) => <ExternalLink size={16} color={color} />}
          />

          <Button
            variant="ghost"
            size="auto"
            onPress={copyAddress}
            label={t('location.copyAddress')}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
