/**
 * Extends app.json. Android renders OpenStreetMap through MapLibre, so no Google Maps key is
 * needed (iOS uses Apple Maps). Map tile settings are EXPO_PUBLIC_MAP_* variables, see .env.example.
 *
 * Preview and production builds (EXPO_PUBLIC_APP_ENV is set by their eas.json profile) drop
 * SYSTEM_ALERT_WINDOW, the "draw over other apps" permission the dev client's debug overlay uses.
 * Users never need it, and it is a sensitive permission to ship.
 */
const isDevelopmentBuild = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') === 'development';

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    blockedPermissions: [
      ...(config.android?.blockedPermissions ?? []),
      ...(isDevelopmentBuild ? [] : ['android.permission.SYSTEM_ALERT_WINDOW']),
    ],
  },
});
