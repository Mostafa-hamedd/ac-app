import { Image, View, type ViewProps } from 'react-native';

export const SPLASH_LOGO_ASPECT = 424 / 140;

/**
 * The design's 371px logo on a 390px screen, capped so it keeps sensible proportions
 * on iPads and unfolded foldables. Shared with the landing intro so the logo
 * stays the same size across the handover.
 */
export function getSplashLogoWidth(screenWidth: number): number {
  return Math.min(screenWidth * (371 / 390), 480);
}

/**
 * Native splash logo width (`imageWidth` in app.json). The in-app splash and the
 * landing intro start at this size so the handover isn't visible.
 */
export const NATIVE_SPLASH_LOGO_WIDTH = 180;

/**
 * In-app loading screen shown while the session is restored and fonts load
 * (see `src/app/_layout.tsx`). Looks identical to the native splash, which is
 * released on this view's first layout: Android can't draw the app window while
 * the native splash is held, so holding it any longer shows a blank black window.
 * Not a routable screen — the router can't render anything until the session
 * status resolves.
 */
export function AppSplash({ onLayout }: Pick<ViewProps, 'onLayout'>) {
  return (
    <View onLayout={onLayout} className="flex-1 items-center justify-center bg-primary">
      <Image
        source={require('@/assets/images/splash-icon.png')}
        resizeMode="contain"
        // Explicit height: with only aspectRatio, the image's natural size overrides the width.
        style={{
          width: NATIVE_SPLASH_LOGO_WIDTH,
          height: NATIVE_SPLASH_LOGO_WIDTH / SPLASH_LOGO_ASPECT,
        }}
      />
    </View>
  );
}
