/**
 * Extends app.json. Android renders OpenStreetMap through MapLibre, so no Google Maps key is
 * needed (iOS uses Apple Maps). Map tile settings are EXPO_PUBLIC_MAP_* variables, see .env.example.
 *
 * Preview and production builds (EXPO_PUBLIC_APP_ENV is set by their eas.json profile) drop
 * SYSTEM_ALERT_WINDOW, the "draw over other apps" permission the dev client's debug overlay uses.
 * Users never need it, and it is a sensitive permission to ship.
 */
const isDevelopmentBuild = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') === 'development';

/**
 * The EAS development profile sets EXPO_PUBLIC_APP_ENV=development. Only that build is limited to
 * arm64-v8a (every modern physical phone), which cuts the debug APK by roughly 70%. Other
 * profiles and local runs without the variable keep all architectures. x86 emulators cannot run
 * the development APK.
 */
const isEasDevelopmentBuild = process.env.EXPO_PUBLIC_APP_ENV === 'development';

/** Adds `android.buildArchs` to the existing expo-build-properties plugin entry. */
function withDevelopmentArchitecture(plugins = []) {
  if (!isEasDevelopmentBuild) return plugins;
  return plugins.map((plugin) => {
    if (!Array.isArray(plugin) || plugin[0] !== 'expo-build-properties') return plugin;
    return [
      plugin[0],
      { ...plugin[1], android: { ...plugin[1]?.android, buildArchs: ['arm64-v8a'] } },
    ];
  });
}

module.exports = ({ config }) => ({
  ...config,
  plugins: withDevelopmentArchitecture(config.plugins),
  android: {
    ...config.android,
    blockedPermissions: [
      ...(config.android?.blockedPermissions ?? []),
      ...(isDevelopmentBuild ? [] : ['android.permission.SYSTEM_ALERT_WINDOW']),
    ],
  },
});
