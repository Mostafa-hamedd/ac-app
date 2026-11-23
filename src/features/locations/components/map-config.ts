import type { StyleSpecification } from '@maplibre/maplibre-react-native';

/**
 * Android map source (OpenStreetMap via MapLibre). Everything is configurable through
 * EXPO_PUBLIC_* variables, so the provider can change without a code change:
 *
 * - EXPO_PUBLIC_MAP_STYLE_URL: full MapLibre style URL from a provider (MapTiler, Stadia,
 *   Protomaps, self-hosted). Wins over the tile URL. Put any provider key in this URL via an
 *   EAS environment variable, never in source. Note EXPO_PUBLIC_ values ship inside the app.
 * - EXPO_PUBLIC_MAP_TILE_URL: raster tile template, e.g. https://tiles.example.com/{z}/{x}/{y}.png
 * - EXPO_PUBLIC_MAP_ATTRIBUTION: attribution text shown on the map.
 *
 * The fallback below is the public OSM tile server. Its usage policy
 * (https://operations.osmfoundation.org/policies/tiles/) makes it acceptable for development
 * and light testing only: switch to a provider or your own tiles before a production release.
 */
const DEV_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_ATTRIBUTION = '© OpenStreetMap contributors';

/** Identifies this app to tile servers (OSM blocks library-default User-Agents). */
export const MAP_USER_AGENT = 'AutoConnect/1.0 (com.paralleltech.autoconnect)';

const styleUrl = process.env.EXPO_PUBLIC_MAP_STYLE_URL?.trim();
const tileUrl = process.env.EXPO_PUBLIC_MAP_TILE_URL?.trim() || DEV_TILE_URL;

export const MAP_ATTRIBUTION =
  process.env.EXPO_PUBLIC_MAP_ATTRIBUTION?.trim() || DEFAULT_ATTRIBUTION;

export const MAP_STYLE: string | StyleSpecification = styleUrl
  ? styleUrl
  : {
      version: 8,
      sources: {
        'base-tiles': {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          maxzoom: 19,
          attribution: MAP_ATTRIBUTION,
        },
      },
      layers: [{ id: 'base-tiles', type: 'raster', source: 'base-tiles' }],
    };
