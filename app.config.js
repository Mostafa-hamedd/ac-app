/**
 * Extends app.json. The Android Google Maps key is read from the environment at
 * build time so it never lands in git. Set GOOGLE_MAPS_ANDROID_API_KEY in
 * .env.local for local builds, or as an EAS secret for cloud builds, and restrict
 * the key in Google Cloud Console to this package name + your signing SHA-1.
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
    config: {
      ...config.android?.config,
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY },
    },
  },
});
