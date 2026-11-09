/**
 * Extends app.json. The Android Google Maps key is read from the environment at
 * build time so it never lands in git. Set GOOGLE_MAPS_ANDROID_API_KEY in
 * .env.local for local builds, or as an EAS secret for cloud builds, and restrict
 * the key in Google Cloud Console to this package name + your signing SHA-1.
 */
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY },
    },
  },
});
